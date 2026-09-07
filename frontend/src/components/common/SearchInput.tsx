import { useEffect, useState } from "react";
import { TextInput, type TextInputProps } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

interface SearchInputProps extends Omit<TextInputProps, "onChange" | "value"> {
  value: string;
  onDebouncedChange: (value: string) => void;
  delay?: number;
}

export function SearchInput({
  value,
  onDebouncedChange,
  delay = 300,
  ...rest
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const [debounced] = useDebouncedValue(local, delay);

  useEffect(() => {
    onDebouncedChange(debounced);
    // onDebouncedChange is expected to be stable (from useState setter / useCallback)
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TextInput
      leftSection={<IconSearch size={16} />}
      placeholder="Search patients…"
      value={local}
      onChange={(e) => setLocal(e.currentTarget.value)}
      aria-label="Search patients"
      {...rest}
    />
  );
}
