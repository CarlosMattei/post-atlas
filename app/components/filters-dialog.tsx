"use client";

import { Checkbox } from "react-aria-components/Checkbox";
import { CheckboxGroup } from "react-aria-components/CheckboxGroup";
import { Dialog } from "react-aria-components/Dialog";
import { DialogTrigger } from "react-aria-components/Modal";
import { ListBox, ListBoxItem } from "react-aria-components/ListBox";
import { Modal, ModalOverlay } from "react-aria-components/Modal";
import { Button as RACButton } from "react-aria-components/Button";
import { Select, SelectValue } from "react-aria-components/Select";
import { Popover } from "react-aria-components/Popover";
import { Button } from "./button";
import { CheckIcon, ChevronDownIcon, XIcon } from "./icons";
import { cx } from "@/app/lib/cx";
import { labelClassName } from "./ui";

export type OrderOption = "recentes" | "score" | "titulo" | "antigos";

export type PostFilters = {
  statuses: string[];
  tags: string[];
  onlyWithImages: boolean;
  order: OrderOption;
};

export const defaultFilters: PostFilters = {
  statuses: [],
  tags: [],
  onlyWithImages: false,
  order: "recentes",
};

export const statusFilterOptions = [
  { value: "rascunho", label: "Rascunho" },
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
  { value: "agendado", label: "Agendado" },
  { value: "publicando", label: "Publicando" },
  { value: "publicado", label: "Publicado" },
  { value: "erro", label: "Erro" },
  { value: "arquivado", label: "Arquivado" },
];

export const tagFilterOptions = [
  { value: "n8n", label: "n8n" },
  { value: "automação", label: "Automação" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "produtividade", label: "Produtividade" },
  { value: "ia", label: "IA" },
];

const orderOptions: Array<{ value: OrderOption; label: string }> = [
  { value: "recentes", label: "Atualizados recentemente" },
  { value: "antigos", label: "Atualizados há mais tempo" },
  { value: "score", label: "Maior score" },
  { value: "titulo", label: "Título (A–Z)" },
];

export function countActiveFilters(filters: PostFilters): number {
  return (
    filters.statuses.length +
    filters.tags.length +
    (filters.onlyWithImages ? 1 : 0) +
    (filters.order === defaultFilters.order ? 0 : 1)
  );
}

const triggerClassName = cx(
  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-ds border border-ds-line bg-ds-surface px-2 text-sm font-medium leading-5 text-ds-text no-underline outline-none transition-colors",
  "data-[hovered]:bg-ds-surface-hover data-[pressed]:bg-ds-surface-hover",
  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ds-focus",
);

const checkboxClassName = cx(
  "group flex cursor-pointer items-center gap-2 rounded-ds py-1 pr-2 text-sm leading-5 text-ds-text outline-none",
  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ds-focus",
);

const checkboxBoxClassName = cx(
  "flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-ds-line bg-ds-surface text-ds-on-brand transition-colors",
  "group-data-[hovered]:border-ds-focus",
  "group-data-[selected]:border-ds-brand group-data-[selected]:bg-ds-brand",
  "group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-ds-focus",
);

const selectClassName = cx(
  "flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-ds border border-ds-line bg-ds-surface px-2.5 text-sm text-ds-text outline-none transition-colors",
  "data-[hovered]:bg-ds-surface-hover data-[pressed]:bg-ds-surface-hover",
  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ds-focus",
);

const listBoxItemClassName = cx(
  "flex cursor-pointer items-center justify-between gap-2 rounded-ds px-2.5 py-1.5 text-sm text-ds-text outline-none",
  "data-[focused]:bg-ds-surface-hover data-[selected]:bg-ds-surface-selected data-[selected]:font-medium data-[selected]:text-ds-selected-text",
);

export function FiltersDialog({
  filters,
  onChange,
}: {
  filters: PostFilters;
  onChange: (filters: PostFilters) => void;
}) {
  const activeCount = countActiveFilters(filters);

  function update(patch: Partial<PostFilters>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <DialogTrigger>
      <RACButton className={triggerClassName}>
        <span>Filtros</span>
        {activeCount > 0 ? (
          <span
            aria-hidden="true"
            className="inline-flex size-4 items-center justify-center rounded-full bg-ds-brand text-[10px] font-bold leading-none text-ds-on-brand"
          >
            {activeCount}
          </span>
        ) : null}
      </RACButton>

      <ModalOverlay
        isDismissable
        className={
          "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[2px] " +
          "data-[entering]:animate-in data-[entering]:fade-in data-[entering]:duration-150 " +
          "data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:duration-100"
        }
      >
        <Modal className="w-[calc(100vw-2rem)] max-w-md data-[entering]:animate-in data-[entering]:zoom-in-95 data-[entering]:duration-150 data-[exiting]:animate-out data-[exiting]:zoom-out-95 data-[exiting]:duration-100">
          <Dialog
            aria-label="Filtrar posts"
            className="rounded-ds-lg border border-ds-line bg-ds-surface text-ds-text shadow-ds-overlay outline-none"
          >
            {({ close }) => (
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-ds-line px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold leading-5 text-ds-text">
                      Filtrar posts
                    </h2>
                    <p className="mt-0.5 text-xs leading-4 text-ds-text-subtle">
                      Combine status, tags e ordenação para refinar a fila.
                    </p>
                  </div>
                  <Button
                    variant="subtle"
                    size="icon-sm"
                    aria-label="Fechar filtros"
                    onPress={close}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>

                <form
                  className="flex flex-col gap-4 px-4 py-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    close();
                  }}
                >
                  <CheckboxGroup
                    aria-labelledby="filters-status-label"
                    className="flex flex-col gap-1"
                    value={filters.statuses}
                    onChange={(statuses: string[]) => update({ statuses })}
                  >
                    <span id="filters-status-label" className={labelClassName}>
                      Status
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {statusFilterOptions.map((option) => (
                        <Checkbox
                          key={option.value}
                          value={option.value}
                          className={checkboxClassName}
                        >
                          <span className={checkboxBoxClassName}>
                            <CheckIcon
                              className="size-3 opacity-0 group-data-[selected]:opacity-100"
                              strokeWidth={2.6}
                            />
                          </span>
                          {option.label}
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroup>

                  <CheckboxGroup
                    aria-labelledby="filters-tag-label"
                    className="flex flex-col gap-1"
                    value={filters.tags}
                    onChange={(tags: string[]) => update({ tags })}
                  >
                    <span id="filters-tag-label" className={labelClassName}>
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {tagFilterOptions.map((option) => (
                        <Checkbox
                          key={option.value}
                          value={option.value}
                          className={checkboxClassName}
                        >
                          <span className={checkboxBoxClassName}>
                            <CheckIcon
                              className="size-3 opacity-0 group-data-[selected]:opacity-100"
                              strokeWidth={2.6}
                            />
                          </span>
                          {option.label}
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroup>

                  <Checkbox
                    isSelected={filters.onlyWithImages}
                    onChange={(onlyWithImages) => update({ onlyWithImages })}
                    className={checkboxClassName}
                  >
                    <span className={checkboxBoxClassName}>
                      <CheckIcon
                        className="size-3 opacity-0 group-data-[selected]:opacity-100"
                        strokeWidth={2.6}
                      />
                    </span>
                    Somente posts com imagem
                  </Checkbox>

                  <div className="flex flex-col gap-1">
                    <span className={labelClassName}>Ordenar por</span>
                    <Select
                      aria-label="Ordenar por"
                      selectedKey={filters.order}
                      onSelectionChange={(key) =>
                        update({ order: key as OrderOption })
                      }
                    >
                      <RACButton className={selectClassName}>
                        <SelectValue className="flex-1 truncate text-left" />
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-4 shrink-0 text-ds-text-subtle"
                        />
                      </RACButton>
                      <Popover
                        className={
                          "z-60 min-w-(--trigger-width) rounded-ds-lg border border-ds-line " +
                          "bg-ds-surface p-1 shadow-ds-overlay outline-none"
                        }
                      >
                        <ListBox className="max-h-60 overflow-y-auto outline-none">
                          {orderOptions.map((option) => (
                            <ListBoxItem
                              key={option.value}
                              id={option.value}
                              textValue={option.label}
                              className={listBoxItemClassName}
                            >
                              {option.label}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Popover>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-ds-line pt-3">
                    <Button
                      variant="subtle"
                      size="sm"
                      onPress={() => onChange(defaultFilters)}
                    >
                      Limpar filtros
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button variant="subtle" size="sm" onPress={close}>
                        Cancelar
                      </Button>
                      <Button type="submit" variant="primary" size="sm">
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
