export const defaultColorList = [
  '#058F85',
  '#FDB537',
  '#EFC758',
  '#7D88BD',
  '#5497A7',
  '#4581B7',
  '#93C4C8',
  '#E8B080',
  '#81B1C7',
  '#DC514C'
]

export const editFormRules = {
  nameInput: [{ rule: (value: string) => value?.toString().trim(), message: '日程不能为空' }],
  cycleInput: [
    { rule: (value: string) => value?.toString().trim(), message: '周期不能为空' },
    {
      rule: (value: string) => /^第\d+周 至 第\d+周$/.test(value),
      message: '周期格式有误'
    }
  ],
  timeInput: [
    { rule: (value: string) => value?.toString().trim(), message: '时间不能为空' },
    {
      rule: (value: string) => /^周[一二三四五六日] 第\d+\-\d+节$/.test(value),
      message: '时间格式有误'
    }
  ],
  locationInput: [{ rule: (value: string) => value?.toString().trim(), message: '地点不能为空' }]
}
