import React from "react";
import {
  Close,
  Content,
  Overlay,
  Portal,
  Root,
  Title,
} from "@radix-ui/react-dialog";

import "./Modal.css";

const CloseButton = () => {
  return (
    <Close className="absolute top-3.5 right-3.5 p-1 hover:bg-gray-100 rounded-full cursor-pointer">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </Close>
  );
};

interface ModalProps {
  title: string;
  opened: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ title, opened, onClose, children }: ModalProps) => (
  <Root open={opened} onOpenChange={onClose}>
    <Portal>
      <Overlay className="modal-overlay fixed inset-0 bg-black/50" />
      <Content
        className="modal-content fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-sm rounded-lg bg-white shadow-xl p-4"
        aria-describedby={undefined}
      >
        <Title className="text-lg font-medium mb-4">{title}</Title>
        {children}
        <CloseButton />
      </Content>
    </Portal>
  </Root>
);