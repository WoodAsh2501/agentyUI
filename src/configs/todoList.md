---
page: homepage
actions:
  deleteTodoItem: tap, delete
  addTodoItem: tap, input, addLine("todoItem")
  editTodoItem: tap, input, edit
  sortItem: sortByPrompt("按照重要紧急的四象限排序")
---

# TodoList

## 重要且紧急

[购买后年的机票](agentyui:todoItem)
[准备明天的演讲](agentyui:todoItem)

## 重要但不紧急

[学习Vue框架](agentyui:todoItem)
[更新个人简历](agentyui:todoItem)

## 不重要但紧急

[回复邮件](agentyui:todoItem)
[安排团队会议](agentyui:todoItem)

## 不重要且不紧急

[整理工作空间](agentyui:todoItem)
[浏览行业新闻](agentyui:todoItem)