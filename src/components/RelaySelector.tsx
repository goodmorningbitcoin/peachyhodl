import { Check, ChevronsUpDown, Wifi, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useAppContext } from "@/hooks/useAppContext";

interface RelaySelectorProps {
  className?: string;
}

export function RelaySelector(props: RelaySelectorProps) {
  const { className } = props;
  const { config, updateConfig } = useAppContext();

  const relays = config.relayMetadata.relays;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const normalizeRelayUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (trimmed.includes('://')) {
      return trimmed;
    }
    return `wss://${trimmed}`;
  };

  const handleAddRelay = (url: string) => {
    const normalized = normalizeRelayUrl(url);
    const exists = relays.some(r => r.url === normalized);
    if (!exists) {
      updateConfig((current) => ({
        ...current,
        relayMetadata: {
          relays: [...current.relayMetadata!.relays, { url: normalized, read: true, write: true }],
          updatedAt: current.relayMetadata!.updatedAt,
        },
      }));
    }
    setOpen(false);
    setInputValue("");
  };

  const handleRemoveRelay = (url: string) => {
    updateConfig((current) => ({
      ...current,
      relayMetadata: {
        relays: current.relayMetadata!.relays.filter(r => r.url !== url),
        updatedAt: current.relayMetadata!.updatedAt,
      },
    }));
  };

  const isValidRelayInput = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const normalized = normalizeRelayUrl(trimmed);
    try {
      new URL(normalized);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="truncate">
              {relays.length > 0
                ? `${relays.length} relay${relays.length > 1 ? 's' : ''}`
                : "Select relay..."
              }
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search relays or type URL..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue && isValidRelayInput(inputValue) ? (
                <CommandItem
                  onSelect={() => handleAddRelay(inputValue)}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">Add custom relay</span>
                    <span className="text-xs text-muted-foreground">
                      {normalizeRelayUrl(inputValue)}
                    </span>
                  </div>
                </CommandItem>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {inputValue ? "Invalid relay URL" : "No relay found."}
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {relays
                .filter((relay) =>
                  !inputValue ||
                  relay.url.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((relay) => (
                  <CommandItem
                    key={relay.url}
                    value={relay.url}
                    onSelect={() => {
                      handleRemoveRelay(relay.url);
                      setOpen(false);
                      setInputValue("");
                    }}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-100" />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{relay.url.replace(/^wss?:\/\//, '')}</span>
                      <span className="text-xs text-muted-foreground">
                        {relay.read && relay.write ? 'read + write' : relay.read ? 'read' : 'write'}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              {inputValue && isValidRelayInput(inputValue) && (
                <CommandItem
                  onSelect={() => handleAddRelay(inputValue)}
                  className="cursor-pointer border-t"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">Add custom relay</span>
                    <span className="text-xs text-muted-foreground">
                      {normalizeRelayUrl(inputValue)}
                    </span>
                  </div>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
