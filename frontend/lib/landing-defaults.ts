export const DEFAULT_WHATSAPP_PHONE = '966920035161'
export const DEFAULT_WHATSAPP_DISPLAY = 'BAB International Corp'
export const DEFAULT_OFFICIAL_WEBSITE = 'https://bab.com.sa'
export const DEFAULT_OFFICIAL_EMAIL = 'sales@bab.com.sa'
export const DEFAULT_PROFILE_DESCRIPTION_EN =
  'BAB International Corp is a Riyadh-based enterprise technology company delivering omnichannel engagement, AI voice bots, and contact-center solutions across Saudi Arabia and MENA.'
export const DEFAULT_PROFILE_DESCRIPTION_AR =
  'باب إنترناشونال شركة تقنية مؤسسية مقرها الرياض تقدّم حلول التفاعل متعدد القنوات والروبوتات الصوتية ومراكز الاتصال في المملكة ومنطقة الشرق الأوسط وشمال أفريقيا.'

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(message)}`
}
