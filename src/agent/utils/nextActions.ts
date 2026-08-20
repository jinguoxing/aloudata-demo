import { AgentTask } from '../contracts';

export interface NextActionItem {
  id: string;
  title: string;
  text: string;
  badge: string;
  hasFile?: boolean;
}

export function getNextActions(task: AgentTask): NextActionItem[] {
  const stage = task.stage || 'ASK_DATA';
  const region =
    task.context?.region ||
    (typeof task.context?.scope === 'string'
      ? task.context.scope
      : task.context?.scope?.region) ||
    '闵行区';
  const metricName = task.context?.metricName || '按期办结率';

  switch (stage) {
    case 'ASK_DATA':
      return [
        {
          id: 'act_ask_metric',
          title: '发起问数',
          text: `帮我查一下上周${region}公共服务热线工单${metricName}。`,
          badge: '指标问数',
        },
        {
          id: 'act_diagnose',
          title: '归因诊断',
          text: `为什么${metricName}环比下降了？请做多维归因分析。`,
          badge: '智能归因',
        },
        {
          id: 'act_upload',
          title: '融合清单分析',
          text: '结合重点关注工单清单，分析这批工单对办结率的拖累影响。',
          badge: '数据融合',
          hasFile: true,
        },
        {
          id: 'act_schedule',
          title: '周期调度',
          text: '以后每周一上午 9 点帮我做一次这个分析，生成周报。',
          badge: '自动化',
        },
      ];

    case 'METRIC_RESOLUTION':
      return [
        {
          id: 'act_diagnose_reason',
          title: '下钻归因',
          text: `为什么${metricName}环比下降了？请做多维归因分析。`,
          badge: '归因分析',
        },
        {
          id: 'act_scope_qibao',
          title: '街镇下钻',
          text: `只看七宝镇的${metricName}表现如何？`,
          badge: '空间下钻',
        },
        {
          id: 'act_trend',
          title: '历史趋势',
          text: `看下最近四周${metricName}的历史趋势变化。`,
          badge: '趋势分析',
        },
        {
          id: 'act_yoy',
          title: '同比对比',
          text: `对比去年同期的同比数据怎么样？`,
          badge: '同比分析',
        },
      ];

    case 'ANALYSIS':
      return [
        {
          id: 'act_upload_focus',
          title: '上传融合分析',
          text: '我上传了本周重点关注工单清单，请帮我看看这批工单对按期办结率的影响。',
          badge: '工单清单比对',
          hasFile: true,
        },
        {
          id: 'act_create_sch',
          title: '自动化周期任务',
          text: '以后每周一上午 9 点帮我做一次这个分析，生成周报。',
          badge: '周期调度',
        },
        {
          id: 'act_switch_scope',
          title: '切换到七宝镇',
          text: '切换到七宝镇单独做一次归因分析。',
          badge: '空间下钻',
        },
        {
          id: 'act_share_res',
          title: '生成分享',
          text: '生成精选分析分享链接。',
          badge: '协同分享',
        },
      ];

    case 'FILE_ENRICHMENT':
      return [
        {
          id: 'act_sch_weekly',
          title: '创建周报调度',
          text: '以后每周一上午 9 点帮我做一次这个分析，生成周报。',
          badge: '创建周期任务',
        },
        {
          id: 'act_share_now',
          title: '对外分享',
          text: '生成精选分享链接。',
          badge: '分享结果',
        },
        {
          id: 'act_trend_q',
          title: '趋势查询',
          text: '对比最近四周的历史趋势。',
          badge: '时序分析',
        },
      ];

    case 'SCHEDULE_CONFIRM':
    case 'SCHEDULED':
      return [
        {
          id: 'act_share_final',
          title: '生成精选分享链接',
          text: '帮我生成精选分享链接对外发送。',
          badge: '对外分享',
        },
        {
          id: 'act_switch_tot',
          title: '切换指标',
          text: '换成总体办结率指标看看。',
          badge: '指标切换',
        },
        {
          id: 'act_scope_xz',
          title: '下钻莘庄镇',
          text: '只看莘庄镇的表现。',
          badge: '空间下钻',
        },
      ];

    case 'SHARE':
      return [
        {
          id: 'act_qibao_again',
          title: '下钻七宝镇',
          text: '只看七宝镇的数据表现。',
          badge: '空间下钻',
        },
        {
          id: 'act_trend_again',
          title: '四周趋势',
          text: '看下最近四周的历史趋势。',
          badge: '趋势分析',
        },
      ];

    default:
      return [
        {
          id: 'act_default_1',
          title: '发起问数',
          text: `查一下上周公共服务热线${metricName}。`,
          badge: '问数',
        },
      ];
  }
}
