import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-center"
      duration={2600}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-pill group-[.toaster]:border-0 group-[.toaster]:bg-ink group-[.toaster]:text-bg group-[.toaster]:shadow-shl group-[.toaster]:font-serif",
          description: "group-[.toast]:opacity-80",
          actionButton: "group-[.toast]:bg-acc group-[.toast]:text-on-acc",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
