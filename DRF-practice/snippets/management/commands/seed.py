from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from snippets.models import Snippet
import random

LANGUAGES = ['python', 'javascript', 'typescript', 'ruby', 'go']
STYLES = ['monokai', 'friendly', 'colorful', 'default']

CODES = {
    'python': 'def hello():\n    print("Hello, World!")',
    'javascript': 'function hello() {\n    console.log("Hello, World!");\n}',
    'typescript': 'const hello = (): void => {\n    console.log("Hello, World!");\n};',
    'ruby': 'def hello\n    puts "Hello, World!"\nend',
    'go': 'func hello() {\n    fmt.Println("Hello, World!")\n}',
}

class Command(BaseCommand):
    help = 'データベースにサンプルデータを投入します'

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=5)
        parser.add_argument('--snippets', type=int, default=30)

    def handle(self, *args, **kwargs):
        user_count = kwargs['users']
        snippet_count = kwargs['snippets']

        users = []
        for i in range(1, user_count + 1):
            user, created = User.objects.get_or_create(username=f'user{i}')
            if created:
                user.set_password('password')
                user.save()
            users.append(user)
        self.stdout.write(f'ユーザー {len(users)} 件作成')

        for i in range(1, snippet_count + 1):
            lang = random.choice(LANGUAGES)
            Snippet.objects.create(
                title=f'スニペット {i}',
                code=CODES[lang],
                language=lang,
                style=random.choice(STYLES),
                owner=random.choice(users + [None]),
            )
        self.stdout.write(f'スニペット {snippet_count} 件作成')