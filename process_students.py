import os
from openai import OpenAI

# Путь к папке с файлами студентов
students_folder = "/workspace/students/02_04_26"
prompt_file = "/workspace/students/latex_prompt.txt"

# Читаем промпт
with open(prompt_file, 'r', encoding='utf-8') as f:
    base_prompt = f.read()

# Получаем список txt файлов
txt_files = [f for f in os.listdir(students_folder) if f.endswith('.txt')]

print(f"Найдено файлов: {len(txt_files)}")
print(f"Файлы: {txt_files}")

# Инициализируем клиент OpenAI
client = OpenAI()

for txt_file in txt_files:
    txt_path = os.path.join(students_folder, txt_file)
    tex_path = txt_path.replace('.txt', '.tex')
    
    print(f"\nОбработка файла: {txt_file}")
    
    # Читаем содержимое txt файла
    with open(txt_path, 'r', encoding='utf-8') as f:
        transcript = f.read()
    
    # Формируем полный промпт
    full_prompt = f"{base_prompt}\n\nТРАНСКРИПТ ЗАНЯТИЯ:\n{transcript}"
    
    try:
        # Отправляем запрос к API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.3
        )
        
        latex_content = response.choices[0].message.content
        
        # Извлекаем только код из code block если он есть
        if "```latex" in latex_content:
            start = latex_content.find("```latex") + len("```latex")
            end = latex_content.find("```", start)
            latex_content = latex_content[start:end].strip()
        elif "```" in latex_content:
            start = latex_content.find("```") + len("```")
            end = latex_content.find("```", start)
            latex_content = latex_content[start:end].strip()
        
        # Сохраняем .tex файл
        with open(tex_path, 'w', encoding='utf-8') as f:
            f.write(latex_content)
        
        print(f"Создан файл: {tex_path}")
        
    except Exception as e:
        print(f"Ошибка при обработке {txt_file}: {e}")

print("\nГотово!")
