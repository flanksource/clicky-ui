import { useState } from "react";
import { Button, Modal } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function ModalDemo() {
  const [simple, setSimple] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <DemoSection
      id="modal"
      title="Modal"
      description="Modal shell with title, close button, ESC handler, backdrop click-to-close."
    >
      <DemoRow>
        <Button onClick={() => setSimple(true)}>Open simple</Button>
        <Button variant="destructive" onClick={() => setConfirm(true)}>
          Open destructive
        </Button>
      </DemoRow>
      <Modal open={simple} onClose={() => setSimple(false)} title="Quick info">
        <p className="text-sm">This is a simple modal. Press ESC or click the backdrop to close.</p>
      </Modal>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete item"
        size="sm"
        footer={
          <div className="flex justify-end gap-density-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirm(false)}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm">This action cannot be undone.</p>
      </Modal>
    </DemoSection>
  );
}
