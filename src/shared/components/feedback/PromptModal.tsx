import { useEffect, useState } from 'react';
import { TextAreaInput } from '../form/TextAreaInput';
import { Button, type ButtonProps } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface PromptModalProps {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  confirmLabel?: string;
  confirmVariant?: ButtonProps['variant'];
  /** Se verdadeiro, exige texto para confirmar (ex.: motivo de cancelamento). */
  requireText?: boolean;
  onConfirm: (text: string) => void;
  onClose: () => void;
}

/** Modal de confirmação com campo de texto (motivo, justificativa...). */
export function PromptModal({
  open,
  title,
  description,
  label = 'Motivo',
  placeholder,
  confirmLabel = 'Confirmar',
  confirmVariant = 'primary',
  requireText = true,
  onConfirm,
  onClose,
}: PromptModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) {
      setText('');
      setError(undefined);
    }
  }, [open]);

  const confirm = () => {
    if (requireText && !text.trim()) return setError('Campo obrigatório');
    onConfirm(text.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button variant={confirmVariant} onClick={confirm}>{confirmLabel}</Button>
        </>
      }
    >
      {description && <p className="mb-3 text-sm text-slate-600">{description}</p>}
      <TextAreaInput label={label} value={text} onChange={(v) => { setText(v); setError(undefined); }} placeholder={placeholder} error={error} rows={3} required={requireText} />
    </Modal>
  );
}
