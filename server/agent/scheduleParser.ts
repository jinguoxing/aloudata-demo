export interface ParsedSchedule {
  isValid: boolean;
  frequency: string;
  weekday?: number;
  time?: string;
  timezone: string;
  taskName: string;
  missingSlots: string[];
  displayText: string;
  errorMessage?: string;
}

export function parseSchedule(text: string, defaultMetric = '按期办结率', defaultRegion = '上海市闵行区'): ParsedSchedule {
  const missingSlots: string[] = [];
  const timezone = 'Asia/Shanghai';

  // 1. Parse Weekday / Day frequency
  let weekday: number | undefined = undefined;
  let dayLabel = '';

  if (/周一|星期一|礼拜一/.test(text)) {
    weekday = 1;
    dayLabel = '每周一';
  } else if (/周二|星期二|礼拜二/.test(text)) {
    weekday = 2;
    dayLabel = '每周二';
  } else if (/周三|星期三|礼拜三/.test(text)) {
    weekday = 3;
    dayLabel = '每周三';
  } else if (/周四|星期四|礼拜四/.test(text)) {
    weekday = 4;
    dayLabel = '每周四';
  } else if (/周五|星期五|礼拜五/.test(text)) {
    weekday = 5;
    dayLabel = '每周五';
  } else if (/周六|星期六|礼拜六/.test(text)) {
    weekday = 6;
    dayLabel = '每周六';
  } else if (/周日|周天|星期日|星期天|礼拜天/.test(text)) {
    weekday = 7;
    dayLabel = '每周日';
  } else if (/每天|每日/.test(text)) {
    weekday = 0;
    dayLabel = '每天';
  } else if (/每周/.test(text)) {
    // Has weekly indicator but no specific day
    missingSlots.push('执行日期（如周一/周五）');
  } else {
    missingSlots.push('执行周期（如每周一/每天）');
  }

  // 2. Parse Time of day
  let time: string | undefined = undefined;
  let hasTime = false;

  // Afternoon / Evening (下午, 晚上, 傍晚, 15点)
  const pmMatch = text.match(/(?:下午|晚上|傍晚|夜间)\s*(\d{1,2})([点时:：](\d{1,2})?半?)?/i);
  if (pmMatch) {
    let rawHour = parseInt(pmMatch[1], 10);
    if (rawHour < 12) rawHour += 12;
    let minute = 0;
    if (pmMatch[0].includes('半')) {
      minute = 30;
    } else if (pmMatch[3]) {
      minute = parseInt(pmMatch[3], 10);
    }
    time = `${rawHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    hasTime = true;
  }

  // Morning (上午, 早上, 8点, 9点)
  const amMatch = text.match(/(?:上午|早上|清晨|早晨)\s*(\d{1,2})([点时:：](\d{1,2})?半?)?/i);
  if (amMatch && !hasTime) {
    const rawHour = parseInt(amMatch[1], 10);
    let minute = 0;
    if (amMatch[0].includes('半')) {
      minute = 30;
    } else if (amMatch[3]) {
      minute = parseInt(amMatch[3], 10);
    }
    time = `${rawHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    hasTime = true;
  }

  // Exact standard time: HH:mm
  const standardTimeMatch = text.match(/(\d{1,2})\s*[:：]\s*(\d{2})/);
  if (standardTimeMatch && !hasTime) {
    const hour = parseInt(standardTimeMatch[1], 10);
    const minute = parseInt(standardTimeMatch[2], 10);
    time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    hasTime = true;
  }

  // Generic hour: e.g. 15点, 9点, 9点半
  const directHourMatch = text.match(/(\d{1,2})\s*[点时](半|\d{1,2}分?)?/);
  if (directHourMatch && !hasTime) {
    let rawHour = parseInt(directHourMatch[1], 10);
    if (rawHour < 7) rawHour += 12; // e.g. 3点 -> 15:00
    let minute = 0;
    if (directHourMatch[2]?.includes('半')) {
      minute = 30;
    } else if (directHourMatch[2]) {
      minute = parseInt(directHourMatch[2].replace('分', ''), 10) || 0;
    }
    time = `${rawHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    hasTime = true;
  }

  if (!hasTime) {
    missingSlots.push('具体触发时间（如 09:00 或 15:00）');
  }

  const isValid = missingSlots.length === 0;
  const frequency = isValid ? `${dayLabel} ${time}` : `${dayLabel || '周期未定'} ${time || '时间未定'}`.trim();
  const taskName = `${defaultRegion}公共服务热线${defaultMetric}${weekday === 0 ? '每日监测' : '周度监测与归因'}`;

  return {
    isValid,
    frequency,
    weekday,
    time,
    timezone,
    taskName,
    missingSlots,
    displayText: isValid
      ? `已成功解析调度规则：【${frequency}（${timezone}）】。任务将按此时间自动触发并生成分析周报。`
      : `已提取部分周期信息，但缺少：${missingSlots.join('、')}。请补充具体时间后再确认创建。`,
    errorMessage: isValid ? undefined : `缺少调度要素：${missingSlots.join('、')}`,
  };
}
