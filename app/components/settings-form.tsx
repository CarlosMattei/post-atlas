"use client";

import { useState } from "react";
import { Switch } from "react-aria-components/Switch";
import { ToggleButton } from "react-aria-components/ToggleButton";
import { ToggleButtonGroup } from "react-aria-components/ToggleButtonGroup";
import { Button, ButtonLink } from "./button";
import {
  CheckIcon,
  ClockIcon,
  CopyIcon,
  GlobeIcon,
  LockIcon,
  RefreshIcon,
  ShieldIcon,
} from "./icons";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DetailList,
  labelClassName,
  inputClassName,
  selectClassName,
} from "./ui";
import { cx } from "@/app/lib/cx";
import { scheduleConfig, weekdayLabels } from "@/app/lib/data";

export function SettingsForm() {
  const [paused, setPaused] = useState(scheduleConfig.paused);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Rotina de publicação"
              description="Horário, dias e fuso usados pela fila de posts."
              action={
                <Badge tone={paused ? "warning" : "success"}>
                  {paused ? "Pausada" : "Ativa"}
                </Badge>
              }
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="publish-time" className={labelClassName}>
                  Horário diário
                </label>
                <div className="relative">
                  <ClockIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
                  <input
                    id="publish-time"
                    type="time"
                    defaultValue={scheduleConfig.publishTime}
                    className={`${inputClassName} pl-8`}
                  />
                </div>
                <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
                  A fila é publicada no primeiro ciclo válido após este horário.
                </p>
              </div>

              <div>
                <label htmlFor="timezone" className={labelClassName}>
                  Fuso horário
                </label>
                <div className="relative">
                  <GlobeIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
                  <select
                    id="timezone"
                    defaultValue={scheduleConfig.timezone}
                    className={`${selectClassName} pl-8`}
                  >
                    <option value="America/Sao_Paulo">
                      America/Sao_Paulo
                    </option>
                    <option value="America/Manaus">America/Manaus</option>
                    <option value="America/Bahia">America/Bahia</option>
                  </select>
                </div>
                <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
                  Fuso fixo da operação, conforme o TDD.
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className={labelClassName}>Dias da semana</span>
                <ToggleButtonGroup
                  aria-label="Dias da semana"
                  selectionMode="multiple"
                  defaultSelectedKeys={scheduleConfig.publishWeekdays.map(String)}
                  className="flex flex-wrap gap-1.5"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <ToggleButton
                      key={day}
                      id={String(day)}
                      className={({ isSelected }) =>
                        cx(
                          "inline-flex h-9 min-w-11 cursor-pointer items-center justify-center rounded-ds border px-2 text-xs font-semibold outline-none transition-colors",
                          "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ds-focus",
                          isSelected
                            ? "border-transparent bg-ds-brand text-ds-on-brand data-[hovered]:bg-ds-brand-hover"
                            : "border-ds-line bg-ds-surface text-ds-text-subtle data-[hovered]:bg-ds-surface-hover data-[hovered]:text-ds-text",
                        )
                      }
                    >
                      {weekdayLabels[day]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>

              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-ds-lg border border-ds-line px-3 py-2.5">
                  <div className="min-w-0">
                    <Switch
                      isSelected={paused}
                      onChange={setPaused}
                      className="group flex cursor-pointer items-center gap-3 outline-none"
                    >
                      <span
                        aria-hidden="true"
                        className="relative h-5 w-8 shrink-0 rounded-full bg-ds-neutral-hover transition-colors group-data-[selected]:bg-ds-brand group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-ds-focus"
                      >
                        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform group-data-[selected]:translate-x-3" />
                      </span>
                      <span className="text-sm font-medium text-ds-text">
                        Pausar publicações automáticas
                      </span>
                    </Switch>
                    <p className="mt-1 pl-11 text-xs leading-4 text-ds-text-subtle">
                      A fila e os horários fixos param imediatamente. O score
                      continua disponível.
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <p className="text-xs leading-4 text-ds-text-subtle">
                O workflow atual usa o cron 0 9 * * 1-5 e lê apenas o campo
                paused.
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader
              title="Fila e alertas"
              description="Limites que disparam avisos no Telegram."
              action={<Badge tone="info">Telegram</Badge>}
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="min-queue" className={labelClassName}>
                  Alerta de fila curta
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="min-queue"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={scheduleConfig.minQueueAlert}
                    className={`${inputClassName} w-24`}
                  />
                  <span className="text-sm text-ds-text-subtle">
                    posts aprovados
                  </span>
                </div>
                <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
                  Envia aviso quando a fila ficar abaixo deste valor.
                </p>
              </div>

              <div className="rounded-ds-lg bg-ds-surface-hover p-3">
                <p className="text-xs font-semibold text-ds-text">
                  Situação atual
                </p>
                <p className="mt-1 text-2xl font-semibold text-ds-text">3</p>
                <p className="text-xs text-ds-text-subtle">
                  posts aprovados na fila
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title="Segurança"
              description="Segredos usados pelos webhooks do n8n."
              action={<Badge tone="warning">Pendente</Badge>}
            />
            <CardBody className="flex flex-col gap-4">
              <div>
                <label htmlFor="webhook-secret" className={labelClassName}>
                  X-Webhook-Secret
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <LockIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
                    <input
                      id="webhook-secret"
                      type="password"
                      placeholder="Não configurado"
                      className={`${inputClassName} pl-8`}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    Gerar
                  </Button>
                </div>
                <p className="mt-1 text-xs leading-4 text-ds-text-subtle">
                  Valide no primeiro nó do webhook de score.
                </p>
              </div>

              <div>
                <label htmlFor="score-webhook" className={labelClassName}>
                  Webhook de score
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="score-webhook"
                    readOnly
                    defaultValue="https://n8n.local/webhook/linkedin-score-post"
                    className={inputClassName}
                  />
                  <Button
                    variant="subtle"
                    size="icon"
                    aria-label="Copiar URL do webhook"
                  >
                    <CopyIcon className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-ds-lg bg-ds-warning-bg px-3 py-2 text-xs leading-4 text-ds-warning-text">
                <p className="font-semibold">Endpoint sem autenticação</p>
                <p className="mt-0.5">
                  Até configurar o segredo, restrinja o acesso pela rede local.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="LinkedIn"
              description="Token e escopos da publicação."
              action={<Badge tone="warning">Expira em breve</Badge>}
            />
            <CardBody>
              <DetailList
                items={[
                  { label: "Perfil", value: "Carlos Mattei" },
                  { label: "Escopo", value: "w_member_social" },
                  { label: "Token expira em", value: "31 out 2026" },
                  { label: "Versão da API", value: "202610" },
                ]}
              />
            </CardBody>
            <CardFooter>
              <ButtonLink href="/conexao" variant="subtle" size="sm">
                <RefreshIcon className="size-3.5" />
                Reautorizar
              </ButtonLink>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-ds-text-subtle">
          <ShieldIcon className="size-4" />
          Alterações afetam o próximo ciclo do workflow.
        </div>
        <div className="flex items-center gap-2">
          <Button variant="subtle" type="reset">
            Descartar
          </Button>
          <Button variant="primary" type="submit">
            <CheckIcon className="size-4" />
            Salvar alterações
          </Button>
        </div>
      </Card>
    </form>
  );
}
