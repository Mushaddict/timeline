export interface ZodiacInfo {
  name: string
  symbol: string
  element: string
  dates: string
}

const zodiacSigns: ZodiacInfo[] = [
  { name: '白羊座', symbol: '♈', element: 'fire', dates: '3.21-4.19' },
  { name: '金牛座', symbol: '♉', element: 'earth', dates: '4.20-5.20' },
  { name: '双子座', symbol: '♊', element: 'air', dates: '5.21-6.21' },
  { name: '巨蟹座', symbol: '♋', element: 'water', dates: '6.22-7.22' },
  { name: '狮子座', symbol: '♌', element: 'fire', dates: '7.23-8.22' },
  { name: '处女座', symbol: '♍', element: 'earth', dates: '8.23-9.22' },
  { name: '天秤座', symbol: '♎', element: 'air', dates: '9.23-10.23' },
  { name: '天蝎座', symbol: '♏', element: 'water', dates: '10.24-11.22' },
  { name: '射手座', symbol: '♐', element: 'fire', dates: '11.23-12.21' },
  { name: '摩羯座', symbol: '♑', element: 'earth', dates: '12.22-1.19' },
  { name: '水瓶座', symbol: '♒', element: 'air', dates: '1.20-2.18' },
  { name: '双鱼座', symbol: '♓', element: 'water', dates: '2.19-3.20' }
]

export function useZodiac() {
  const getZodiac = (birthday: string): ZodiacInfo | null => {
    if (!birthday) return null
    
    const date = new Date(birthday)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    let zodiacIndex = -1
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      zodiacIndex = 0
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      zodiacIndex = 1
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) {
      zodiacIndex = 2
    } else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) {
      zodiacIndex = 3
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      zodiacIndex = 4
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      zodiacIndex = 5
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) {
      zodiacIndex = 6
    } else if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) {
      zodiacIndex = 7
    } else if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) {
      zodiacIndex = 8
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      zodiacIndex = 9
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      zodiacIndex = 10
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      zodiacIndex = 11
    }
    
    return zodiacIndex >= 0 ? zodiacSigns[zodiacIndex] : null
  }
  
  return {
    getZodiac,
    zodiacSigns
  }
}
