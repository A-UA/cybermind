import React, { useState, useEffect } from 'react';
import AppSelect from '@/components/common/AppSelect';
import AppInput from '@/components/common/AppInput';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import AppFormItem from '@/components/common/AppFormItem';
import AppRichEditor from '@/components/common/AppRichEditor';
import AppCheckbox from '@/components/common/AppCheckbox';
import { isRichTextEmpty } from '@/lib/richText';
import type { IHelpQuestion, IHelpCategory } from '../types';

interface HelpQuestionFormProps {
  question: IHelpQuestion | null;
  categories: IHelpCategory[];
  defaultCategoryId: number | '';
  onSave: (payload: {
    category_id: number;
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function HelpQuestionForm({
  question,
  categories,
  defaultCategoryId,
  onSave,
  onCancel,
  isSaving,
}: HelpQuestionFormProps) {
  // 本地表单状态
  const [questionText, setQuestionText] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // 报错状态
  const [questionError, setQuestionError] = useState('');
  const [answerError, setAnswerError] = useState('');

  // 初始化或切换编辑对象
  useEffect(() => {
    if (question) {
      setQuestionText(question.question || '');
      setAnswerContent(question.answer || '');
      setCategoryId(question.category_id || '');
      setSortOrder(question.sort_order || 0);
      setIsActive(question.is_active ?? true);
    } else {
      setQuestionText('');
      setAnswerContent('');
      setCategoryId(defaultCategoryId);
      setSortOrder(0);
      setIsActive(true);
    }
    setQuestionError('');
    setAnswerError('');
  }, [question, defaultCategoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!questionText.trim()) {
      setQuestionError('问题内容不能为空');
      hasError = true;
    } else {
      setQuestionError('');
    }

    if (isRichTextEmpty(answerContent)) {
      setAnswerError('答案回复内容不能为空');
      hasError = true;
    } else {
      setAnswerError('');
    }

    if (!categoryId) {
      hasError = true;
    }

    if (hasError) return;

    onSave({
      category_id: Number(categoryId),
      question: questionText.trim(),
      answer: answerContent,
      sort_order: sortOrder,
      is_active: isActive,
    });
  };

  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* 顶部控制栏 */}
      <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center justify-center"
            title="返回问答列表"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
              {question
                ? '编辑常见问答 / EDIT FAQ'
                : '创建常见问答 / CREATE FAQ'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
              请录入常见问题与富文本格式的回答内容
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[3.5deg] hidden sm:inline-block">
          Q&A PANEL
        </div>
      </div>

      {/* 表单卡片 */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6 text-xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大块：问题与富文本答案 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 问题内容 */}
            <AppFormItem
              label="常见问题内容 / QUESTION"
              required
              error={questionError}
            >
              <AppInput
                type="text"
                placeholder="请输入常见问题内容，例如：如何找回登录密码？"
                value={questionText}
                onChange={e => {
                  setQuestionText(e.target.value);
                  if (e.target.value.trim()) setQuestionError('');
                }}
              />
            </AppFormItem>

            {/* 富文本答案 */}
            <AppFormItem
              label="问题解答详情 / ANSWER DETAILS"
              required
              error={answerError}
            >
              <AppRichEditor
                value={answerContent}
                onChange={val => {
                  setAnswerContent(val);
                  if (!isRichTextEmpty(val)) setAnswerError('');
                }}
                preset="basic"
                placeholder="在此撰写常见问题的详细解答..."
              />
            </AppFormItem>
          </div>

          {/* 右侧窄块 */}
          <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
            <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
              分类与排序配置 / SCHEME
            </h3>

            {/* 所属分类 */}
            <AppFormItem label="所属常见问题分类 / BELONGS TO" required>
              <AppSelect
                width="full"
                value={String(categoryId)}
                onValueChange={(val) => setCategoryId(val ? Number(val) : '')}
                placeholder="选择所属分类"
                options={categories.map((category) => ({
                  value: String(category.id),
                  label: category.name,
                }))}
              />
            </AppFormItem>

            {/* 排序序号 */}
            <AppFormItem label="排序序号 / SORT ORDER">
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
              />
            </AppFormItem>

            {/* 分发状态 */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <AppCheckbox
                checked={isActive}
                onCheckedChange={setIsActive}
                label="启用此常见问题解答 (ACTIVE)"
              />
            </div>
          </div>
        </div>

        {/* 提交/取消 按钮 */}
        <div className="flex justify-end space-x-3 border-t-2 border-border pt-6 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
          >
            取消 CANCEL
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-2.5 bg-primary text-primary-foreground border-2 border-border font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>确认保存 SUBMIT</span>
          </button>
        </div>
      </form>
    </div>
  );
}
