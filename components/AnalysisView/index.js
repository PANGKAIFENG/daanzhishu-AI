// 解析视图组件
Component({
  properties: {
    analysis: {
      type: Object,
      value: {
        core: "",
        manifestation: "",
        solution: "",
        tips: ""
      }
    },
    answer: {
      type: String,
      value: ""
    }
  },
  
  data: {
    expanded: {
      core: true,
      manifestation: true,
      solution: true,
      tips: true
    }
  },
  
  methods: {
    toggleSection(e) {
      const section = e.currentTarget.dataset.section;
      const expandedKey = `expanded.${section}`;
      this.setData({
        [expandedKey]: !this.data.expanded[section]
      });
    }
  }
}) 