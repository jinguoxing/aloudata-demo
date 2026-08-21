import React from 'react';
import { AgentBlock, AgentTask, Turn } from '../../agent/contracts';
import { BlockRenderer } from './BlockRenderer';
import { User, Sparkles, FileSpreadsheet } from 'lucide-react';

interface Props {
  turn: Turn;
  task: AgentTask;
  availableBlocks: AgentBlock[];
  onSelectMetric?: (metricId: string) => void;
  onOpenMetricContext?: () => void;
  onFollowUpDiagnosis?: () => void;
  onOpenTrace?: () => void;
  onOpenReport?: (artifactId: string) => void;
  onConfirmSchedule?: () => void;
  onInitiateShare?: () => void;
  onCreateShare?: (blockIds: string[], blocks?: AgentBlock[]) => Promise<any>;
  onOpenReadOnlyView?: () => void;
}

export const ConversationTurn: React.FC<Props> = ({
  turn,
  task,
  availableBlocks,
  onSelectMetric,
  onOpenMetricContext,
  onFollowUpDiagnosis,
  onOpenTrace,
  onOpenReport,
  onConfirmSchedule,
  onInitiateShare,
  onCreateShare,
  onOpenReadOnlyView,
}) => {
  return (
    <section className="space-y-4">
      {/* User Turn */}
      {turn.role === 'user' && (
        <div className="flex justify-end items-start gap-2.5">
          <div className="max-w-[78%] space-y-2">
            {turn.attachments && turn.attachments.length > 0 ? (
              <div className="flex flex-wrap justify-end gap-2">
                {turn.attachments.map((attachment) => (
                  <div
                    key={attachment.attachmentId}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono">{attachment.fileName}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {turn.text ? (
              <div className="rounded-2xl rounded-tr-md bg-slate-900 px-4 py-2.5 text-sm leading-relaxed text-white shadow-xs">
                {turn.text}
              </div>
            ) : null}
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Xino (Assistant) Turn */}
      {turn.blocks && turn.blocks.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Xino</span>
              <span className="text-[11px] text-slate-400">犀诺</span>
            </div>

            <div className="space-y-3">
              {turn.blocks.map((block) => (
                <BlockRenderer
                  key={block.blockId}
                  block={block}
                  availableBlocks={availableBlocks}
                  onSelectMetric={onSelectMetric}
                  onOpenMetricContext={onOpenMetricContext}
                  onFollowUpDiagnosis={onFollowUpDiagnosis}
                  onOpenTrace={onOpenTrace}
                  onOpenReport={onOpenReport}
                  onConfirmSchedule={onConfirmSchedule}
                  onInitiateShare={onInitiateShare}
                  onCreateShare={onCreateShare}
                  onOpenReadOnlyView={onOpenReadOnlyView}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
