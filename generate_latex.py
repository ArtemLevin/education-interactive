#!/usr/bin/env python3
import os
import re

def extract_topic_from_transcript(content):
    """Извлекает тему занятия из транскрипта"""
    content_lower = content.lower()
    
    topics = {
        'уравнения окружности с модулем': ['модуль', 'окружность', 'уравнение'],
        'проценты и банковские расчеты': ['процент', 'банк', 'сумма', 'ставка', 'кредит'],
        'квадратные корни и уравнения': ['корень', 'квадрат', 'x квадрат'],
        'текстовые задачи': ['текстовая', 'задача'],
        'показательные уравнения': ['2 в степени', 'степень', 'показательн'],
        'десятичные дроби': ['0,', 'делит', 'запят'],
        'неравенства': ['неравенств', 'интервал'],
        'тригонометрия': ['sin', 'cos', 'tg', 'ctg', 'синус', 'косинус', 'тангенс'],
        'логарифмы': ['логарифм', 'ln', 'lg'],
        'планиметрия': ['треугольник', 'окружность', 'угол', 'геометр'],
    }
    
    best_topic = "Математика. Подготовка к ЕГЭ"
    best_score = 0
    
    for topic, keywords in topics.items():
        score = sum(1 for kw in keywords if kw in content_lower)
        if score > best_score:
            best_score = score
            best_topic = topic
    
    return best_topic

def get_student_name_friendly(filename):
    name = os.path.splitext(filename)[0]
    return name.capitalize()

def get_student_name_genitive(name):
    genitive_map = {
        'Max': 'Макса',
        'Jana': 'Яны',
        'Jar': 'Яра',
        'Mik': 'Мика',
        'Nadya': 'Нади',
        'Roma': 'Ромы',
    }
    return genitive_map.get(name, f'{name}а')

def generate_latex_content(student_name, student_name_genitive, topic):
    latex = []
    latex.append(r'\documentclass[a4paper,12pt]{article}')
    latex.append('')
    latex.append(r'\usepackage[T2A]{fontenc}')
    latex.append(r'\usepackage[utf8]{inputenc}')
    latex.append(r'\usepackage[russian]{babel}')
    latex.append('')
    latex.append(r'\usepackage{amsmath, amssymb, amsthm, mathtools}')
    latex.append(r'\usepackage{helvet}')
    latex.append(r'\renewcommand{\familydefault}{\sfdefault}')
    latex.append(r'\usepackage{icomma}')
    latex.append(r'\usepackage{geometry}')
    latex.append(r'\usepackage{microtype}')
    latex.append(r'\usepackage{tikz}')
    latex.append(r'\usepackage{tkz-euclide}')
    latex.append(r'\usepackage{pgfplots}')
    latex.append(r'\pgfplotsset{compat=1.18}')
    latex.append(r'\usepackage{tabularx, booktabs, longtable}')
    latex.append(r'\usepackage{enumitem}')
    latex.append(r'\usepackage{hyperref}')
    latex.append(r'\usepackage{parskip}')
    latex.append(r'\usepackage{fancyhdr}')
    latex.append(r'\usepackage{setspace}')
    latex.append(r'\usepackage{xcolor}')
    latex.append('')
    latex.append(r'\definecolor{accent}{HTML}{008080}')
    latex.append(r'\definecolor{darkaccent}{HTML}{004D4D}')
    latex.append(r'\definecolor{textgray}{HTML}{333333}')
    latex.append('')
    latex.append(r'\geometry{left=2cm, right=2cm, top=2cm, bottom=2cm}')
    latex.append(r'\onehalfspacing')
    latex.append('')
    latex.append(r'\hypersetup{')
    latex.append(r'    colorlinks=true,')
    latex.append(r'    linkcolor=accent,')
    latex.append(r'    filecolor=magenta,')
    latex.append(r'    urlcolor=cyan,')
    latex.append(r'}')
    latex.append('')
    latex.append(r'\pagestyle{fancy}')
    latex.append(r'\fancyhf{}')
    latex.append(r'\rhead{\thepage}')
    latex.append(r'\renewcommand{\headrulewidth}{0.5pt}')
    latex.append('')
    latex.append(r'\begin{document}')
    latex.append('')
    latex.append('% Титульный лист')
    latex.append(r'\begin{titlepage}')
    latex.append(r'    \centering')
    latex.append(r'    \vspace*{2cm}')
    latex.append('')
    latex.append(r'    {\Huge\bfseries\color{accent} Чек-лист}\par')
    latex.append(r'    \vspace{0.5cm}')
    latex.append(rf'    {{\Large\color{{textgray}} {topic}}}\par')
    latex.append('')
    latex.append(r'    \vspace{3cm}')
    latex.append('')
    latex.append(r'    {\large\color{textgray} Лёвин Артём Александрович}\par')
    latex.append(rf'    {{\large\color{{textgray}} эксклюзивно для {student_name_genitive}}}\par')
    latex.append('')
    latex.append(r'    \vspace{2cm}')
    latex.append('')
    latex.append(r'    {\large\color{textgray} \today}\par')
    latex.append('')
    latex.append(r'    \vfill')
    latex.append('')
    latex.append('    % Кривая Безье внизу титульного листа')
    latex.append(r'    \begin{tikzpicture}')
    latex.append(r'        \draw[line width=2pt, color=accent, opacity=0.6]')
    latex.append(r'            (0,0) .. controls (2,1.5) and (4,-1) .. (6,0.5)')
    latex.append(r'            .. controls (8,2) and (10,-0.5) .. (12,0);')
    latex.append(r'    \end{tikzpicture}')
    latex.append('')
    latex.append(r'\end{titlepage}')
    latex.append('')
    latex.append(r'\newpage')
    latex.append('')
    latex.append('% Основной чек-лист')
    latex.append(r'\section*{Ключевые знания по теме}')
    latex.append('')
    latex.append(r'\subsection*{Основные понятия и определения}')
    latex.append(r'\begin{itemize}[label=\textcolor{accent}{\textbullet}, leftmargin=*]')
    latex.append(r'    \item Повторение базовых определений по теме занятия')
    latex.append(r'    \item Ключевые термины и их обозначения')
    latex.append(r'    \item Основные свойства и правила')
    latex.append(r'\end{itemize}')
    latex.append('')
    latex.append(r'\subsection*{Формулы и теоремы}')
    latex.append(r'\begin{itemize}[label=\textcolor{accent}{\textbullet}, leftmargin=*]')
    latex.append(r'    \item Основные формулы, рассмотренные на занятии')
    latex.append(r'    \item Теоремы и признаки, необходимые для решения задач')
    latex.append(r'    \item Условия применимости формул')
    latex.append(r'\end{itemize}')
    latex.append('')
    latex.append(r'\subsection*{Методы решения}')
    latex.append(r'\begin{itemize}[label=\textcolor{accent}{\textbullet}, leftmargin=*]')
    latex.append(r'    \item Алгоритмы решения типовых задач')
    latex.append(r'    \item Последовательность действий при решении')
    latex.append(r'    \item Особенности применения методов')
    latex.append(r'\end{itemize}')
    latex.append('')
    latex.append(r'\subsection*{Типичные ошибки}')
    latex.append(r'\begin{itemize}[label=\textcolor{accent}{\textbullet}, leftmargin=*]')
    latex.append(r'    \item Распространённые ошибки при решении задач')
    latex.append(r'    \item Ограничения и условия, которые часто упускают')
    latex.append(r'    \item На что следует обращать особое внимание')
    latex.append(r'\end{itemize}')
    latex.append('')
    latex.append(r'\newpage')
    latex.append('')
    latex.append('% Тренировочный блок')
    latex.append(r'\section*{Тренировочный блок}')
    latex.append('')
    latex.append(r'\subsection*{Базовый уровень (3 задания)}')
    latex.append(r'\begin{enumerate}[label=\arabic*., leftmargin=*]')
    latex.append(r'    \item Решите уравнение, используя определение модуля')
    latex.append(r'    \item Найдите значение выражения, применяя свойства степеней')
    latex.append(r'    \item Упростите алгебраическое выражение')
    latex.append(r'\end{enumerate}')
    latex.append('')
    latex.append(r'\subsection*{Средний уровень (3 задания)}')
    latex.append(r'\begin{enumerate}[label=\arabic*., leftmargin=*, start=4]')
    latex.append(r'    \item Решите систему уравнений')
    latex.append(r'    \item Найдите все корни уравнения, принадлежащие заданному промежутку')
    latex.append(r'    \item Решите неравенство методом интервалов')
    latex.append(r'\end{enumerate}')
    latex.append('')
    latex.append(r'\subsection*{Уровень выше среднего (3 задания)}')
    latex.append(r'\begin{enumerate}[label=\arabic*., leftmargin=*, start=7]')
    latex.append(r'    \item Решите уравнение с параметром')
    latex.append(r'    \item Докажите тождество, используя изученные формулы')
    latex.append(r'    \item Найдите наибольшее/наименьшее значение функции')
    latex.append(r'\end{enumerate}')
    latex.append('')
    latex.append(r'\subsection*{Повышенный уровень (1 задание)}')
    latex.append(r'\begin{enumerate}[label=\arabic*., leftmargin=*, start=10]')
    latex.append(r'    \item Решите комбинированную задачу, требующую применения нескольких методов')
    latex.append(r'\end{enumerate}')
    latex.append('')
    latex.append(r'\newpage')
    latex.append('')
    latex.append('% Ответы')
    latex.append(r'\section*{Ответы к тренировочному блоку}')
    latex.append('')
    latex.append(r'\begin{center}')
    latex.append(r'\renewcommand{\arraystretch}{1.5}')
    latex.append(r'\begin{tabular}{cc}')
    latex.append(r'\toprule')
    latex.append(r'\textbf{№ задания} & \textbf{Ответ} \\')
    latex.append(r'\midrule')
    for i in range(1, 11):
        latex.append(f'{i} & зависит от варианта \\\\')
    latex.append(r'\bottomrule')
    latex.append(r'\end{tabular}')
    latex.append(r'\end{center}')
    latex.append('')
    latex.append(r'\end{document}')
    
    return '\n'.join(latex)

def process_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    filename = os.path.basename(input_path)
    student_name = get_student_name_friendly(filename)
    student_name_genitive = get_student_name_genitive(student_name)
    topic = extract_topic_from_transcript(content)
    
    latex_content = generate_latex_content(student_name, student_name_genitive, topic)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(latex_content)
    
    print(f"Создан файл: {output_path} (тема: {topic})")

def main():
    students_dir = '/workspace/students/02_04_26'
    
    for filename in os.listdir(students_dir):
        if filename.endswith('.txt'):
            input_path = os.path.join(students_dir, filename)
            output_filename = os.path.splitext(filename)[0] + '.tex'
            output_path = os.path.join(students_dir, output_filename)
            
            process_file(input_path, output_path)
    
    print("\nГотово! Все .tex файлы созданы.")

if __name__ == '__main__':
    main()
