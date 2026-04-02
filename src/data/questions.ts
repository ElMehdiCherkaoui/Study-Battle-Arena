// Question Bank — Study Battle Arena MVP
// SQL Pack A: Foundations | Pack B: Intermediate | Pack C: Advanced

export type QuestionType = 'mcq' | 'truefalse' | 'fillblank' | 'scenario';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  pack: 'A' | 'B' | 'C';
  topic: 'sql';
  subtopic: string;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  options?: string[];   // for mcq / truefalse
  answer: string;       // correct answer (or key option)
  hints: [string, string, string]; // hint1 @20s, hint2 @40s, hint3 @50s
  explanation: string;
}

const questions: Question[] = [
  // ========================
  // PACK A — SQL FOUNDATIONS (Easy)
  // ========================
  {
    id: 'sql-a-01',
    pack: 'A', topic: 'sql', subtopic: 'SELECT',
    difficulty: 'easy', type: 'mcq',
    prompt: 'Which SQL keyword is used to retrieve data from a database?',
    options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
    answer: 'SELECT',
    hints: [
      'It\'s the most fundamental SQL command.',
      'It starts with the letter S.',
      'SELECT ... FROM table_name'
    ],
    explanation: 'SELECT is the SQL command used to query and retrieve data from one or more tables.'
  },
  {
    id: 'sql-a-02',
    pack: 'A', topic: 'sql', subtopic: 'WHERE',
    difficulty: 'easy', type: 'mcq',
    prompt: 'Which clause is used to filter records in a SQL query?',
    options: ['FILTER', 'WHERE', 'HAVING', 'LIMIT'],
    answer: 'WHERE',
    hints: [
      'This clause comes after FROM.',
      'It applies conditions to individual rows.',
      'Example: WHERE age > 18'
    ],
    explanation: 'WHERE filters rows based on a condition before any grouping occurs.'
  },
  {
    id: 'sql-a-03',
    pack: 'A', topic: 'sql', subtopic: 'ORDER BY',
    difficulty: 'easy', type: 'scenario',
    prompt: 'Scenario: A teacher wants to display all students sorted by their name alphabetically (A to Z). Which SQL clause should be used?',
    options: ['SORT BY name ASC', 'ORDER BY name ASC', 'ARRANGE BY name', 'GROUP BY name'],
    answer: 'ORDER BY name ASC',
    hints: [
      'Alphabetical order goes from A to Z — that\'s ascending.',
      'The keyword for sorting in SQL is ORDER BY.',
      'Full syntax: ORDER BY column_name ASC'
    ],
    explanation: 'ORDER BY name ASC sorts results alphabetically from A to Z. ASC is the default direction.'
  },
  {
    id: 'sql-a-04',
    pack: 'A', topic: 'sql', subtopic: 'SELECT',
    difficulty: 'easy', type: 'truefalse',
    prompt: 'True or False: SELECT * retrieves all columns from a table.',
    options: ['True', 'False'],
    answer: 'True',
    hints: [
      'The * symbol is a wildcard.',
      'Wildcards represent "all" in many programming contexts.',
      'SELECT * FROM students — this returns every column.'
    ],
    explanation: 'SELECT * retrieves all columns. You can replace * with specific column names to select only what you need.'
  },
  {
    id: 'sql-a-05',
    pack: 'A', topic: 'sql', subtopic: 'LIMIT',
    difficulty: 'easy', type: 'fillblank',
    prompt: 'Complete the query to show only the first 5 students:\nSELECT * FROM students _______ 5;',
    options: ['TOP', 'LIMIT', 'FIRST', 'MAX'],
    answer: 'LIMIT',
    hints: [
      'This keyword restricts how many rows are returned.',
      'It\'s commonly used for pagination.',
      'It works like: SELECT ... LIMIT number'
    ],
    explanation: 'LIMIT restricts the number of rows returned. SELECT * FROM students LIMIT 5 returns only the first 5 rows.'
  },
  {
    id: 'sql-a-06',
    pack: 'A', topic: 'sql', subtopic: 'WHERE',
    difficulty: 'easy', type: 'scenario',
    prompt: 'Scenario: You need to find all students who scored more than 12 in their exam. Which WHERE clause is correct?',
    options: ['WHERE score > 12', 'WHERE score >= 12', 'HAVING score > 12', 'FILTER score > 12'],
    answer: 'WHERE score > 12',
    hints: [
      '"More than" means strictly greater, not equal.',
      'The comparison operator for "greater than" is >.',
      'Use WHERE for filtering individual rows.'
    ],
    explanation: 'WHERE score > 12 filters rows where score is strictly above 12. >= 12 would include 12 as well.'
  },
  {
    id: 'sql-a-07',
    pack: 'A', topic: 'sql', subtopic: 'Aliases',
    difficulty: 'easy', type: 'mcq',
    prompt: 'How do you give a column a temporary name (alias) in a SQL query?',
    options: ['SELECT name RENAME "Full Name"', 'SELECT name AS "Full Name"', 'SELECT name = "Full Name"', 'ALIAS name "Full Name"'],
    answer: 'SELECT name AS "Full Name"',
    hints: [
      'The keyword for setting an alias is two letters long.',
      'Aliases make output columns more readable.',
      'The keyword is AS.'
    ],
    explanation: 'AS creates an alias. SELECT name AS "Full Name" renames the column in the result set only — it doesn\'t change the database.'
  },

  // ========================
  // PACK B — INTERMEDIATE SQL (Medium)
  // ========================
  {
    id: 'sql-b-01',
    pack: 'B', topic: 'sql', subtopic: 'JOIN',
    difficulty: 'medium', type: 'mcq',
    prompt: 'Which JOIN type returns all rows from both tables, even if there is no match?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    answer: 'FULL OUTER JOIN',
    hints: [
      'This join is the most inclusive of all join types.',
      'It combines LEFT JOIN and RIGHT JOIN behavior.',
      'It returns ALL rows from BOTH tables.'
    ],
    explanation: 'FULL OUTER JOIN returns all rows from both tables, filling NULL for non-matching sides.'
  },
  {
    id: 'sql-b-02',
    pack: 'B', topic: 'sql', subtopic: 'GROUP BY',
    difficulty: 'medium', type: 'scenario',
    prompt: 'Scenario: A school wants to count how many students are in each class. Which query structure is correct?',
    options: [
      'SELECT class, COUNT(*) FROM students ORDER BY class',
      'SELECT class, COUNT(*) FROM students GROUP BY class',
      'SELECT class, COUNT(*) FROM students WHERE class',
      'SELECT COUNT(*) FROM students HAVING class'
    ],
    answer: 'SELECT class, COUNT(*) FROM students GROUP BY class',
    hints: [
      'You need to group records by a column.',
      'The keyword for grouping is GROUP BY.',
      'Aggregate functions like COUNT() work together with GROUP BY.'
    ],
    explanation: 'GROUP BY class groups students by their class, and COUNT(*) counts the number of students in each group.'
  },
  {
    id: 'sql-b-03',
    pack: 'B', topic: 'sql', subtopic: 'HAVING',
    difficulty: 'medium', type: 'mcq',
    prompt: 'What is the difference between WHERE and HAVING in SQL?',
    options: [
      'WHERE filters rows before grouping; HAVING filters groups after grouping',
      'HAVING filters rows before grouping; WHERE filters after grouping',
      'They are identical — just different keywords',
      'WHERE works with JOINs; HAVING works with subqueries'
    ],
    answer: 'WHERE filters rows before grouping; HAVING filters groups after grouping',
    hints: [
      'Think about the order of SQL execution.',
      'WHERE comes before GROUP BY in execution order.',
      'HAVING is specifically designed for aggregate conditions.'
    ],
    explanation: 'WHERE filters individual rows before grouping. HAVING filters grouped results, often used with aggregate functions like COUNT(), SUM().'
  },
  {
    id: 'sql-b-04',
    pack: 'B', topic: 'sql', subtopic: 'INNER JOIN',
    difficulty: 'medium', type: 'scenario',
    prompt: 'Scenario: You have a "students" table and a "grades" table. How do you return only students who HAVE grades recorded?',
    options: [
      'LEFT JOIN grades ON students.id = grades.student_id',
      'INNER JOIN grades ON students.id = grades.student_id',
      'FULL JOIN grades ON students.id = grades.student_id',
      'CROSS JOIN grades'
    ],
    answer: 'INNER JOIN grades ON students.id = grades.student_id',
    hints: [
      'You only want rows that exist in BOTH tables.',
      'This is the most common type of join.',
      'INNER JOIN returns only matching rows.'
    ],
    explanation: 'INNER JOIN returns only rows with matching values in both tables. Students without grades and grades without matching students are excluded.'
  },
  {
    id: 'sql-b-05',
    pack: 'B', topic: 'sql', subtopic: 'Aggregate Functions',
    difficulty: 'medium', type: 'fillblank',
    prompt: 'Complete: To find the highest grade in the grades table:\nSELECT _______(grade) FROM grades;',
    options: ['MAX', 'HIGHEST', 'TOP', 'GREATEST'],
    answer: 'MAX',
    hints: [
      'SQL has built-in functions for statistics.',
      'The opposite of this function is MIN.',
      'It returns the maximum value in a column.'
    ],
    explanation: 'MAX() returns the maximum value. MIN() returns minimum, AVG() returns average, SUM() returns total.'
  },
  {
    id: 'sql-b-06',
    pack: 'B', topic: 'sql', subtopic: 'GROUP BY',
    difficulty: 'medium', type: 'truefalse',
    prompt: 'True or False: You can use HAVING without GROUP BY in a query.',
    options: ['True', 'False'],
    answer: 'True',
    hints: [
      'Think about when you apply a condition to the entire result set.',
      'Without GROUP BY, the entire table is treated as one group.',
      'HAVING COUNT(*) > 5 is valid without GROUP BY.'
    ],
    explanation: 'HAVING without GROUP BY treats the entire table as one group. It\'s rare but valid — useful when applying aggregate conditions to the whole table.'
  },
  {
    id: 'sql-b-07',
    pack: 'B', topic: 'sql', subtopic: 'LEFT JOIN',
    difficulty: 'medium', type: 'scenario',
    prompt: 'Scenario: Show ALL students, including those who have NOT submitted any assignment yet (assignment may be NULL). Which join should you use?',
    options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'],
    answer: 'LEFT JOIN',
    hints: [
      'You want ALL students, even with no assignment.',
      'LEFT JOIN keeps all rows from the LEFT (first) table.',
      'Missing values on the right will appear as NULL.'
    ],
    explanation: 'LEFT JOIN returns all rows from the left table (students) and matching rows from the right (assignments). Non-matching rows show NULL for assignment columns.'
  },

  // ========================
  // PACK C — ADVANCED SQL (Hard)
  // ========================
  {
    id: 'sql-c-01',
    pack: 'C', topic: 'sql', subtopic: 'Subqueries',
    difficulty: 'hard', type: 'scenario',
    prompt: 'Scenario: Find students whose grade is higher than the CLASS AVERAGE. Which approach is correct?',
    options: [
      'SELECT * FROM students WHERE grade > AVG(grade)',
      'SELECT * FROM students WHERE grade > (SELECT AVG(grade) FROM students)',
      'SELECT * FROM students HAVING grade > AVG(grade)',
      'SELECT * FROM students JOIN AVG(grade) ON true'
    ],
    answer: 'SELECT * FROM students WHERE grade > (SELECT AVG(grade) FROM students)',
    hints: [
      'You can\'t use aggregate functions directly in WHERE.',
      'The solution involves a query inside another query.',
      'Subqueries in WHERE are wrapped in parentheses.'
    ],
    explanation: 'Aggregate functions like AVG() cannot be used directly in WHERE. A subquery (SELECT AVG(grade) FROM students) calculates the average first, then the outer query compares against it.'
  },
  {
    id: 'sql-c-02',
    pack: 'C', topic: 'sql', subtopic: 'Window Functions',
    difficulty: 'hard', type: 'mcq',
    prompt: 'What does the RANK() OVER (ORDER BY score DESC) function do?',
    options: [
      'Deletes rows in descending order',
      'Assigns a ranking number to each row based on score, highest first',
      'Groups students by score',
      'Returns only the top-ranked student'
    ],
    answer: 'Assigns a ranking number to each row based on score, highest first',
    hints: [
      'RANK() is a window function.',
      'Window functions operate across a "window" of rows without collapsing them.',
      'OVER (ORDER BY score DESC) sorts by score from highest to lowest.'
    ],
    explanation: 'RANK() assigns an integer rank to each row within the result set. OVER (ORDER BY score DESC) means: rank 1 = highest score. Ties share the same rank and the next rank is skipped.'
  },
  {
    id: 'sql-c-03',
    pack: 'C', topic: 'sql', subtopic: 'CTE',
    difficulty: 'hard', type: 'fillblank',
    prompt: 'Complete: A Common Table Expression (CTE) starts with this keyword:\n_______ top_students AS (SELECT * FROM students WHERE grade > 15)',
    options: ['WITH', 'DEFINE', 'CREATE TEMP', 'USING'],
    answer: 'WITH',
    hints: [
      'CTEs are also called "with queries".',
      'They create a named temporary result set.',
      'The keyword is a simple preposition.'
    ],
    explanation: 'WITH defines a CTE (Common Table Expression). It creates a named temporary result that can be referenced in the main query that follows. CTEs improve readability for complex queries.'
  },
  {
    id: 'sql-c-04',
    pack: 'C', topic: 'sql', subtopic: 'Subqueries',
    difficulty: 'hard', type: 'truefalse',
    prompt: 'True or False: A correlated subquery can reference a column from the outer query.',
    options: ['True', 'False'],
    answer: 'True',
    hints: [
      'The word "correlated" implies a relationship between inner and outer.',
      'A correlated subquery depends on the outer query for its values.',
      'It re-executes for each row of the outer query.'
    ],
    explanation: 'A correlated subquery references a column from the outer query. It executes once for each row in the outer query, making it powerful but potentially slow on large tables.'
  },
  {
    id: 'sql-c-05',
    pack: 'C', topic: 'sql', subtopic: 'Optimization',
    difficulty: 'hard', type: 'scenario',
    prompt: 'Scenario: A query on a students table with 1 million rows is very slow when filtering by "city". What is the BEST optimization strategy?',
    options: [
      'Use SELECT * instead of specific columns',
      'Add an INDEX on the city column',
      'Remove the WHERE clause',
      'Use LIMIT 1000000'
    ],
    answer: 'Add an INDEX on the city column',
    hints: [
      'Database performance on large tables often involves data structures for fast lookup.',
      'This optimization creates a separate structure that speeds up searches.',
      'An _______ on a frequently queried column dramatically speeds up filtering.'
    ],
    explanation: 'An INDEX on the city column allows the database to find matching rows in O(log n) time instead of scanning all 1 million rows. It\'s one of the most impactful optimizations for read-heavy queries.'
  },
  {
    id: 'sql-c-06',
    pack: 'C', topic: 'sql', subtopic: 'Transactions',
    difficulty: 'hard', type: 'mcq',
    prompt: 'In SQL, what does ROLLBACK do in a transaction?',
    options: [
      'Saves all changes permanently',
      'Goes back to the previous database version before all changes',
      'Deletes only the last inserted row',
      'Creates a backup of the current state'
    ],
    answer: 'Goes back to the previous database version before all changes',
    hints: [
      'Transactions follow ACID properties.',
      'ROLLBACK is the opposite of COMMIT.',
      'It undoes everything since the last BEGIN/START TRANSACTION.'
    ],
    explanation: 'ROLLBACK undoes all changes made in the current transaction, restoring the database to its state before the transaction began. COMMIT does the opposite — it saves changes permanently.'
  }
];

export default questions;

export const getQuestionsByDifficulty = (difficulty: Difficulty) =>
  questions.filter(q => q.difficulty === difficulty);

export const getQuestionsByPack = (pack: 'A' | 'B' | 'C') =>
  questions.filter(q => q.pack === pack);

export const getDifficultyForPack = (pack: 'A' | 'B' | 'C'): Difficulty =>
  pack === 'A' ? 'easy' : pack === 'B' ? 'medium' : 'hard';

export const getTimerForDifficulty = (difficulty: Difficulty): number =>
  difficulty === 'easy' ? 60 : difficulty === 'medium' ? 45 : 30;

export const shuffled = <T>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);
