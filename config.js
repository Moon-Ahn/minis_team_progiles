/* 사이트 설정
 *
 * 비워 두면 입력 내용이 «그 브라우저에만» 저장됩니다. (혼자 쓰거나 시험해 볼 때)
 * 아래 두 값을 채우면 여러 팀장님이 같은 주소에서 함께 작성하는 모드로 바뀝니다.
 *
 * 값은 Supabase 대시보드 → Project Settings → API 에서 가져옵니다.
 *   supabaseUrl     : Project URL
 *   supabaseAnonKey : anon / public key  (브라우저에 공개되는 키가 맞습니다)
 *
 * 먼저 supabase/schema.sql 을 SQL Editor에 붙여 넣어 실행해 주세요.
 * 자세한 순서는 README.md 를 보시면 됩니다.
 */
window.EUM_CONFIG = {
  supabaseUrl: 'https://ceyhpctssxrimvvqtoni.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleWhwY3Rzc3hyaW12dnF0b25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzI5NTksImV4cCI6MjEwNTUwODk1OX0.gjwI6x1eViThocQEWPwnO_5xDZiQoZ7GoBz9IRnX6oc'
};
