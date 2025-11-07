import * as Checkbox from "@radix-ui/react-checkbox";
import { cx } from "class-variance-authority";
import * as React from "react";

export function ShowMore({
  text,
  className,
  onChange,
}: {
  text: string;
  className?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  const [checked, setChecked] = React.useState(false);
  const label = checked ? "Show less" : text;

  return (
    <div className="flex items-center">
      <Checkbox.Root
        className={cx(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        checked={checked}
        onCheckedChange={(checked: boolean | "indeterminate") => {
          setChecked(checked as boolean);
          onChange?.({
            target: { checked: checked as boolean },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        <Checkbox.Indicator className="flex items-center justify-center text-current">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
    </div>
  );
}

