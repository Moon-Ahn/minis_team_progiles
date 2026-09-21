/* 저장 계층
 *
 * config.js 에 Supabase 정보가 있으면 클라우드 모드로, 없으면 로컬 모드로 동작합니다.
 *   - 클라우드: team_profiles 테이블 + team-photos 스토리지 버킷, 실시간 반영
 *   - 로컬:     localStorage (사진은 data URI로 함께 보관)
 * 클라우드 모드에서도 localStorage에 사본을 남겨 두기 때문에,
 * 네트워크가 끊겨도 마지막으로 본 내용은 그대로 열립니다.
 */
(function(global){
'use strict';

var LOCAL_KEY   = 'eum-team-profiles-v1';
var SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
var TABLE       = 'team_profiles';
var BUCKET      = 'team-photos';

var cfg = global.EUM_CONFIG || {};
var configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

var sb = null;
var listeners = [];

var Store = {
  mode: 'local',      // 'local' | 'cloud'
  error: null,
  configured: configured,
  lastWrite: {}       // 팀별로 «내가» 마지막에 보낸 시각. 메아리를 걸러내는 데 씁니다.
};

/* ---------- 공통 ---------- */
function loadScript(src){
  return new Promise(function(resolve, reject){
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = function(){ reject(new Error('스크립트를 불러오지 못했습니다: ' + src)); };
    document.head.appendChild(s);
  });
}
function readLocal(){
  try{
    var raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
function writeLocal(state){
  try{
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    return true;
  }catch(e){ return false; }
}

/* ---------- 초기화 ---------- */
Store.init = async function(){
  if(!configured){
    Store.mode = 'local';
    return Store.mode;
  }
  try{
    await loadScript(SUPABASE_JS);
    if(!global.supabase || !global.supabase.createClient) throw new Error('supabase-js 로드 실패');
    sb = global.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: false }
    });
    // 연결 확인 겸 첫 조회
    var probe = await sb.from(TABLE).select('id').limit(1);
    if(probe.error) throw probe.error;
    Store.mode = 'cloud';
  }catch(e){
    Store.mode = 'local';
    Store.error = e.message || String(e);
  }
  return Store.mode;
};

/* ---------- 읽기 ---------- */
/* seedTeams: 클라우드가 비어 있을 때 처음 채워 넣을 기본 팀 목록 */
Store.loadAll = async function(seedTeams){
  if(Store.mode === 'cloud'){
    var res = await sb.from(TABLE).select('id, sort_order, data').order('sort_order', {ascending:true});
    if(res.error){
      Store.error = res.error.message;
      Store.mode = 'local';
    }else if(!res.data.length){
      await Store.seed(seedTeams);
      return seedTeams.slice();
    }else{
      var teams = res.data.map(function(r){
        var t = r.data || {};
        t.id = r.id;
        return t;
      });
      writeLocal({version:1, teams:teams, updated:Date.now()});
      return teams;
    }
  }
  var local = readLocal();
  return (local && Array.isArray(local.teams) && local.teams.length) ? local.teams : seedTeams.slice();
};

Store.seed = async function(teams){
  if(Store.mode !== 'cloud') return;
  var rows = teams.map(function(t, i){ return {id:t.id, sort_order:i, data:t}; });
  var res = await sb.from(TABLE).upsert(rows);
  if(res.error) Store.error = res.error.message;
};

/* ---------- 쓰기 ---------- */
Store.saveTeam = async function(team, order, allTeams){
  var okLocal = writeLocal({version:1, teams:allTeams, updated:Date.now()});
  if(Store.mode !== 'cloud'){
    if(!okLocal) throw new Error('브라우저 저장 공간이 가득 찼습니다.');
    return;
  }
  var at = new Date().toISOString();
  var res = await sb.from(TABLE).upsert({
    id: team.id,
    sort_order: order,
    data: team,
    updated_at: at
  });
  if(res.error) throw new Error(res.error.message);
  Store.lastWrite[team.id] = at;
};

Store.saveOrder = async function(allTeams){
  writeLocal({version:1, teams:allTeams, updated:Date.now()});
  if(Store.mode !== 'cloud') return;
  var at = new Date().toISOString();
  var rows = allTeams.map(function(t, i){
    return {id:t.id, sort_order:i, data:t, updated_at:at};
  });
  var res = await sb.from(TABLE).upsert(rows);
  if(res.error) throw new Error(res.error.message);
  allTeams.forEach(function(t){ Store.lastWrite[t.id] = at; });
};

Store.deleteTeam = async function(id, allTeams){
  writeLocal({version:1, teams:allTeams, updated:Date.now()});
  if(Store.mode !== 'cloud') return;
  var res = await sb.from(TABLE).delete().eq('id', id);
  if(res.error) throw new Error(res.error.message);
};

/* ---------- 이미지 ---------- */
/* 로컬 모드는 data URI를, 클라우드 모드는 스토리지 공개 URL을 돌려줍니다. */
Store.putImage = async function(blob, teamId, kind, index, ext){
  if(Store.mode !== 'cloud'){
    return await new Promise(function(resolve, reject){
      var r = new FileReader();
      r.onload = function(){ resolve(r.result); };
      r.onerror = function(){ reject(new Error('이미지를 읽지 못했습니다.')); };
      r.readAsDataURL(blob);
    });
  }
  var path = teamId + '/' + kind + '-' + index + '-' + Date.now() + '.' + (ext || 'webp');
  var up = await sb.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/webp',
    cacheControl: '31536000',
    upsert: true
  });
  if(up.error) throw new Error(up.error.message);
  var pub = sb.storage.from(BUCKET).getPublicUrl(path);
  return pub.data.publicUrl;
};

/* 교체·삭제된 사진 정리 (공개 URL에서 경로를 되짚어 지웁니다) */
Store.dropImage = async function(url){
  if(Store.mode !== 'cloud' || !url || url.indexOf('/' + BUCKET + '/') === -1) return;
  try{
    var path = url.split('/' + BUCKET + '/')[1];
    if(path) await sb.storage.from(BUCKET).remove([decodeURIComponent(path.split('?')[0])]);
  }catch(e){ /* 정리 실패는 사용자 흐름을 막지 않습니다 */ }
};

/* ---------- 실시간 ---------- */
Store.subscribe = function(fn){
  listeners.push(fn);
  if(Store.mode !== 'cloud' || Store._channel) return;
  Store._channel = sb.channel('team_profiles_changes')
    .on('postgres_changes', {event:'*', schema:'public', table:TABLE}, function(payload){
      listeners.forEach(function(cb){
        try{ cb(payload); }catch(e){}
      });
    })
    .subscribe();
};

global.Store = Store;
})(window);
