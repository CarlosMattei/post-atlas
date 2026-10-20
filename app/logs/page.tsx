import type { Metadata } from "next";
import { Button } from "@/app/components/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  RefreshIcon,
  SearchIcon,
} from "@/app/components/icons";
import {
  Badge,
  Card,
  CardFooter,
  PageContainer,
  PageHeader,
  ResultBadge,
  StatCard,
  inputClassName,
  selectClassName,
} from "@/app/components/ui";
import { getPostById, publishLogs } from "@/app/lib/data";
import {
  formatDateTime,
  truncate,
  workflowLabels,
} from "@/app/lib/format";

export const metadata: Metadata = {
  title: "Logs · Post Atlas",
};

export default function LogsPage() {
  const todayLogs = publishLogs.filter((log) =>
    log.executedAt.startsWith("2026-10-19"),
  );
  const successes = todayLogs.filter((log) => log.result === "sucesso").length;
  const errors = todayLogs.filter((log) => log.result === "erro").length;
  const ignored = todayLogs.filter((log) => log.result === "ignorado").length;

  return (
    <PageContainer>
      <PageHeader
        title="Logs"
        description="Histórico de execuções do workflow unificado, com resultado e mensagem de cada ciclo."
        actions={
          <>
            <Button variant="outline">
              <RefreshIcon className="size-4" />
              Atualizar
            </Button>
            <Button variant="primary">
              <DownloadIcon className="size-4" />
              Exportar CSV
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Execuções hoje"
          value={String(todayLogs.length)}
          hint="Todas as seções do workflow"
        />
        <StatCard label="Sucessos" value={String(successes)} hint="Sem falhas" />
        <StatCard
          label="Erros"
          value={String(errors)}
          hint={errors === 0 ? "Nenhuma falha hoje" : "Requer atenção"}
        />
        <StatCard
          label="Ignorados"
          value={String(ignored)}
          hint="Ciclos sem post elegível"
        />
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-ds-line px-4 py-2.5">
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Buscar logs</span>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-subtle" />
            <input
              type="search"
              placeholder="Buscar na mensagem"
              className={`${inputClassName} pl-8`}
            />
          </label>

          <label className="w-full sm:w-44">
            <span className="sr-only">Filtrar por workflow</span>
            <select className={selectClassName} defaultValue="todos">
              <option value="todos">Todos os workflows</option>
              <option value="fila">Publicação na fila</option>
              <option value="horario-fixo">Horário fixo</option>
              <option value="busca">Busca de conteúdo</option>
              <option value="alerta">Alerta de fila</option>
              <option value="score">Score por IA</option>
            </select>
          </label>

          <label className="w-full sm:w-36">
            <span className="sr-only">Filtrar por resultado</span>
            <select className={selectClassName} defaultValue="todos">
              <option value="todos">Todos os resultados</option>
              <option value="sucesso">Sucesso</option>
              <option value="erro">Erro</option>
              <option value="ignorado">Ignorado</option>
            </select>
          </label>

          <label className="w-full sm:w-40">
            <span className="sr-only">Período</span>
            <select className={selectClassName} defaultValue="7">
              <option value="1">Hoje</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
            </select>
          </label>

          <span className="ml-auto text-xs text-ds-text-subtle">
            {publishLogs.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ds-line bg-ds-surface-hover/50">
                <th
                  scope="col"
                  className="w-40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
                >
                  Data e hora
                </th>
                <th
                  scope="col"
                  className="w-44 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
                >
                  Workflow
                </th>
                <th
                  scope="col"
                  className="w-56 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
                >
                  Post
                </th>
                <th
                  scope="col"
                  className="w-28 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
                >
                  Resultado
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-ds-text-subtle"
                >
                  Mensagem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ds-line">
              {publishLogs.map((log) => {
                const post = getPostById(log.postId);

                return (
                  <tr
                    key={log.id}
                    className="align-top transition-colors hover:bg-ds-surface-hover/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ds-text">
                      {formatDateTime(log.executedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-ds-text">
                      {workflowLabels[log.workflow]}
                    </td>
                    <td className="px-4 py-3 text-xs leading-4 text-ds-text-subtle">
                      {post ? truncate(post.title, 48) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ResultBadge result={log.result} />
                    </td>
                    <td
                      className={
                        log.result === "erro"
                          ? "px-4 py-3 text-xs leading-5 text-ds-danger-text"
                          : "px-4 py-3 text-xs leading-5 text-ds-text-subtle"
                      }
                    >
                      {log.message}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <CardFooter>
          <div className="flex items-center gap-2">
            <Badge tone="success">Workflow saudável</Badge>
            <span className="text-xs text-ds-text-subtle">
              Logs de negócio em publish_logs
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="subtle"
              size="icon-sm"
              aria-label="Página anterior"
              isDisabled
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="px-2 text-xs font-medium text-ds-text">1 de 1</span>
            <Button
              variant="subtle"
              size="icon-sm"
              aria-label="Próxima página"
              isDisabled
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
