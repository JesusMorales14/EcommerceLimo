import os
import json
import sys
import urllib.request
import urllib.error

api_key  = os.environ.get('GEMINI_API_KEY', '')
pr_title = os.environ.get('PR_TITLE', '(sin título)')
pr_num   = os.environ.get('PR_NUMBER', '')

if not api_key:
    print('⚠️  GEMINI_API_KEY no configurada — omitiendo revisión IA.')
    sys.exit(0)

try:
    diff = open('/tmp/pr.diff').read().strip()
except FileNotFoundError:
    print('⚠️  /tmp/pr.diff no encontrado.')
    sys.exit(0)

if not diff:
    print('ℹ️  Sin cambios en .ts/.html/.scss — omitiendo revisión.')
    sys.exit(0)

print(f'📄 Diff size: {len(diff)} chars')
print(f'📋 PR: {pr_title}')

prompt = (
    f'Eres un revisor senior especializado en Angular 21 (standalone + signals) y NestJS 11.\n'
    f'Analiza el siguiente diff del Pull Request: "{pr_title}".\n'
    f'Responde en español con estas 4 secciones exactas:\n\n'
    f'## Problemas criticos\n'
    f'(bugs o vulnerabilidades; si no hay, escribe "Ninguno")\n\n'
    f'## Sugerencias de mejora\n'
    f'(maximo 4 puntos concisos)\n\n'
    f'## Puntos positivos\n'
    f'(maximo 3 puntos)\n\n'
    f'## Veredicto\n'
    f'(una frase: aprobado o requiere cambios)\n\n'
    f'Diff:\n```diff\n{diff[:10000]}\n```'
)

payload = json.dumps({
    'contents': [{'parts': [{'text': prompt}]}],
    'generationConfig': {'maxOutputTokens': 800, 'temperature': 0.3},
}).encode('utf-8')

url = (
    'https://generativelanguage.googleapis.com/v1beta/'
    f'models/gemini-3.1-flash-lite:generateContent?key={api_key}'
)

req = urllib.request.Request(
    url,
    data=payload,
    headers={'Content-Type': 'application/json'},
    method='POST',
)

print('🌐 Llamando a Gemini API...')
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode('utf-8')
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    print(f'❌ HTTP {e.code}: {body}')
    sys.exit(0)
except Exception as e:
    print(f'❌ Error de red: {e}')
    sys.exit(0)

print('✅ Respuesta recibida')

try:
    data   = json.loads(raw)
    review = data['candidates'][0]['content']['parts'][0]['text']
except (KeyError, IndexError, json.JSONDecodeError) as e:
    print(f'❌ Error parseando respuesta: {e}')
    print(f'Respuesta raw (primeros 500 chars): {raw[:500]}')
    sys.exit(0)

comment = (
    '## Revision Automatica de Codigo - IA (Gemini 1.5 Flash)\n\n'
    + review
    + '\n\n---\n'
    + '<sub>Analisis generado por Google Gemini 1.5 Flash · '
    + 'Pipeline CI/CD EcommerceLimo · 4.6 Calidad 4.0</sub>'
)

with open('/tmp/ai-review.md', 'w', encoding='utf-8') as f:
    f.write(comment)

print(f'📝 Revisión escrita en /tmp/ai-review.md ({len(comment)} chars)')
