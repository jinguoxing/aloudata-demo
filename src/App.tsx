import React, { useState } from 'react';
import { PageState } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Composer } from './components/Composer';
import { ContextPanel } from './components/ContextPanel';
import { ReportModal } from './components/ReportModal';
import { ShareModal } from './components/ShareModal';
import { PresenterControl } from './components/PresenterControl';
import { AgentThread } from './components/agent/AgentThread';
import { useAgentTask } from './agent/useAgentTask';

// Keyframe legacy pages for presenter inspection
import { Page01Ask } from './components/pages/Page01Ask';
import { Page02Disambiguation } from './components/pages/Page02Disambiguation';
import { Page03Diagnosis } from './components/pages/Page03Diagnosis';
import { Page04FileAnalysis } from './components/pages/Page04FileAnalysis';
import { Page05ScheduleConfirm } from './components/pages/Page05ScheduleConfirm';
import { Page06ScheduleSuccess } from './components/pages/Page06ScheduleSuccess';
import { Page07ShareSelect } from './components/pages/Page07ShareSelect';
import { Page08ReadOnly } from './components/pages/Page08ReadOnly';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageState>('page01');
  const [viewMode, setViewMode] = useState<'continuous' | 'keyframes'>('continuous');
  const [showPresenterControl, setShowPresenterControl] = useState(true);
  const [activeRightPanel, setActiveRightPanel] = useState<'metric' | 'python' | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSelectedCount, setShareSelectedCount] = useState(4);
  const [customShareUrl, setCustomShareUrl] = useState<string | undefined>(undefined);

  // Real Agent Task Runtime Hook
  const {
    task,
    loading,
    activeTraceExecution,
    activeShareArtifact,
    sendMessage,
    selectMetric,
    confirmSchedule,
    createShare,
    triggerDiagnosis,
    resetSession,
  } = useAgentTask();

  // Flatten all task blocks
  const allTaskBlocks = task.turns.flatMap((t) => t.blocks);

  const pageSequence: PageState[] = [
    'page01',
    'page02',
    'page03',
    'page04',
    'page05',
    'page06',
    'page07',
    'page08',
  ];

  const handleNavigateNext = () => {
    const currentIndex = pageSequence.indexOf(currentPage);
    if (currentIndex < pageSequence.length - 1) {
      const nextPage = pageSequence[currentIndex + 1];
      setCurrentPage(nextPage);

      if (nextPage === 'page02') {
        setActiveRightPanel('metric');
      } else if (nextPage === 'page04') {
        setActiveRightPanel('python');
      } else {
        setActiveRightPanel(null);
      }
    }
  };

  const handleNavigateTo = (page: PageState) => {
    setCurrentPage(page);
    if (page === 'page02') {
      setActiveRightPanel('metric');
    } else if (page === 'page04') {
      setActiveRightPanel('python');
    } else {
      setActiveRightPanel(null);
    }
  };

  const isReadOnlyPage = currentPage === 'page08';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Presenter Keyframe Control Bar */}
      {showPresenterControl && (
        <PresenterControl
          currentPage={currentPage}
          onNavigate={(page) => {
            setViewMode('keyframes');
            handleNavigateTo(page);
          }}
          onClose={() => setShowPresenterControl(false)}
        />
      )}

      {/* Main Unified Header */}
      <Header
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'page01') {
            resetSession();
          }
          handleNavigateTo(page);
        }}
        showPresenterControl={showPresenterControl}
        setShowPresenterControl={setShowPresenterControl}
        activeRightPanel={activeRightPanel}
        toggleRightPanel={(panel) => setActiveRightPanel(panel)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* App Main Body Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar (Hidden on Page 08 for clean read-only presentation) */}
        {!isReadOnlyPage && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              if (page === 'page01') {
                resetSession();
              }
              handleNavigateTo(page);
            }}
          />
        )}

        {/* Central Workspace Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/70 overflow-hidden relative">
          {viewMode === 'continuous' && !isReadOnlyPage && currentPage !== 'page07' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <AgentThread
                turns={task.turns}
                loading={loading}
                onSelectMetric={(metricId) => {
                  selectMetric(metricId);
                  setActiveRightPanel('metric');
                }}
                onOpenMetricContext={() => setActiveRightPanel('metric')}
                onFollowUpDiagnosis={() =>
                  triggerDiagnosis('为什么按期办结率环比下降了？请做多维归因分析。')
                }
                onOpenTrace={() => setActiveRightPanel('python')}
                onOpenReport={() => setIsReportModalOpen(true)}
                onConfirmSchedule={() => confirmSchedule()}
                onInitiateShare={() => {
                  sendMessage('生成精选分析分享链接');
                }}
                onCreateShare={async (blockIds, blocksToShare) => {
                  const share = await createShare(blockIds, blocksToShare);
                  if (share?.url) {
                    setCustomShareUrl(`${window.location.origin}${share.url}`);
                  }
                  return share;
                }}
                onOpenReadOnlyView={() => handleNavigateTo('page08')}
                onQuickPrompt={(prompt, hasFile) => {
                  if (hasFile) {
                    const blob = new Blob(
                      ['case_id,street_code,is_overdue\n1001,SH01,1'],
                      { type: 'text/csv' },
                    );
                    const file = new File(
                      [blob],
                      'focus_case_list_2026W32.csv',
                      { type: 'text/csv' },
                    );
                    sendMessage(prompt, [file]);
                  } else {
                    sendMessage(prompt);
                  }
                }}
              />

              {/* Bottom Composer */}
              <Composer
                stage={task.stage}
                loading={loading}
                onSend={async (text, files) => {
                  await sendMessage(text, files);
                }}
              />
            </div>
          ) : (
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
              {currentPage === 'page01' && (
                <Page01Ask onNavigateNext={handleNavigateNext} />
              )}

              {currentPage === 'page02' && (
                <Page02Disambiguation
                  onNavigateNext={handleNavigateNext}
                  onOpenMetricPanel={() => setActiveRightPanel('metric')}
                />
              )}

              {currentPage === 'page03' && (
                <Page03Diagnosis
                  onNavigateNext={handleNavigateNext}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />
              )}

              {currentPage === 'page04' && (
                <Page04FileAnalysis
                  onNavigateNext={handleNavigateNext}
                  onOpenPythonPanel={() => setActiveRightPanel('python')}
                />
              )}

              {currentPage === 'page05' && (
                <Page05ScheduleConfirm onNavigateNext={handleNavigateNext} />
              )}

              {currentPage === 'page06' && (
                <Page06ScheduleSuccess onNavigateNext={handleNavigateNext} />
              )}

              {currentPage === 'page07' && (
                <Page07ShareSelect
                  availableBlocks={allTaskBlocks}
                  onGenerateShareLink={async (count, selectedBlockIds) => {
                    setShareSelectedCount(count);
                    if (selectedBlockIds && selectedBlockIds.length > 0) {
                      const share = await createShare(selectedBlockIds);
                      if (share?.url) {
                        setCustomShareUrl(`${window.location.origin}${share.url}`);
                      }
                    }
                    setIsShareModalOpen(true);
                  }}
                  onCancel={() => handleNavigateTo('page06')}
                />
              )}

              {currentPage === 'page08' && (
                <Page08ReadOnly
                  shareArtifact={activeShareArtifact}
                  taskBlocks={allTaskBlocks}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  onReturnToWorkbench={() => handleNavigateTo('page06')}
                />
              )}
            </div>
          )}
        </main>

        {/* Right Dynamic Context Panel */}
        {!isReadOnlyPage && (
          <ContextPanel
            type={activeRightPanel}
            onClose={() => setActiveRightPanel(null)}
            dynamicExecution={activeTraceExecution}
            metricName={task.context.metricName}
          />
        )}
      </div>

      {/* HTML Analysis Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onShare={() => {
          setIsReportModalOpen(false);
          handleNavigateTo('page07');
        }}
      />

      {/* Share Link Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedCount={shareSelectedCount}
        shareUrl={customShareUrl}
        onOpenReadOnlyView={() => {
          setIsShareModalOpen(false);
          handleNavigateTo('page08');
        }}
      />
    </div>
  );
}
