'use client';

import { Dialog, DialogContent } from '@/shared/components/ui';
import type { CreatePersonInput, Person } from '../types';
import { PersonForm } from './PersonForm';

interface EditPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person;
  onSubmit: (input: CreatePersonInput) => Promise<unknown>;
}

export function EditPersonDialog({ open, onOpenChange, person, onSubmit }: EditPersonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Editar datos"
        description="Actualizá nombre, contacto, rol o estado de la persona."
        size="md"
      >
        <PersonForm
          initial={person}
          submitLabel="Guardar cambios"
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
