# 인수인계 자료 — 식단 보기 웹앱

프로젝트 채팅에서 Claude Code로 넘어가기 위한 묶음입니다.

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | Claude Code가 자동으로 읽는 프로젝트 설명서(구조·규칙·주의점·미해결 항목) |
| `PROMPT.md` | Claude Code 첫 대화에 붙여 넣을 시작 문구 |
| `src/` | 앱 소스 3개 (`index.html`, `Code.gs`, `appsscript.json`) — Apps Script에 올리는 파일 |
| `web/` | 홈 화면 아이콘용 안내 페이지 (`dacpole.com/webapp/food/`에 올림) |
| `data/` | 11월 식단 일괄 등록용 텍스트 |

## 시작 방법
1. 이 폴더를 작업 폴더(예: `~/cafeteria`)로 복사한다.
2. 그 폴더에서 `claude`를 실행한다. `CLAUDE.md`는 자동으로 읽힌다.
3. `PROMPT.md`의 문구를 붙여 넣고 시작한다.
4. 수정이 끝나면 `src/` 파일을 Apps Script에 붙여 넣고 **배포 관리 → 수정 → 새 버전**으로 배포한다.
