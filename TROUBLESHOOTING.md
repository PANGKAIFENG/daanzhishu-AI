# 解忧杂货铺小程序排错文档

## 问题记录：页面跳转时 "Trace is not defined" 错误

### 错误信息
```
[渲染层错误] ReferenceError: Trace is not defined
    at http://127.0.0.1:62016/__pageframe__/__dev__/WARemoteDebugForLib3.js?t=wechat&s=1742813421949:1:253701
    at http://127.0.0.1:62016/__pageframe__/__dev__/WARemoteDebugForLib3.js?t=wechat&s=1742813421949:1:254052
```

### 问题原因

这个错误出现在从首页跳转到答案页面时，通过 URL 参数传递 JSON 数据导致的。具体原因：

1. **URL 参数传递复杂数据的限制**：
   - 通过 URL 参数传递复杂的 JSON 对象时，即使使用了 `encodeURIComponent` 和 `JSON.stringify`，当数据包含特殊字符时，可能导致解析错误
   - 微信小程序内部对 URL 参数可能有长度限制或字符限制
   - 字符编码/解码过程可能出现不一致问题

2. **页面间数据传递的最佳实践**：
   - 对于结构复杂或包含特殊字符的数据，避免使用 URL 参数传递
   - 小程序环境下，全局数据传递是更安全可靠的方式

### 解决方案

我们采用了以下方案解决问题：

1. **使用全局数据存储代替 URL 参数**：
   - 在 `app.js` 中添加全局变量存储当前答案及相关信息
   ```javascript
   globalData: {
     historyAnswers: [],
     currentAnswer: null,
     isRareAnswer: false
   }
   ```

2. **修改首页跳转逻辑**：
   - 将数据先保存到全局变量，再进行简单跳转
   ```javascript
   // 将答案保存到全局数据
   const app = getApp();
   app.globalData.currentAnswer = answer;
   app.globalData.isRareAnswer = isRare;
   
   // 简化跳转，不携带复杂参数
   wx.navigateTo({
     url: '/pages/answer/answer'
   });
   ```

3. **修改答案页面数据获取方式**：
   - 从全局变量获取数据而非解析 URL 参数
   - 增加安全检查，防止无数据时页面崩溃
   ```javascript
   onLoad() {
     // 从全局数据获取答案信息
     const app = getApp();
     const answer = app.globalData.currentAnswer;
     const isRare = app.globalData.isRareAnswer;

     if (answer) {
       this.setData({
         currentAnswer: answer,
         isRareAnswer: isRare
       });
     } else {
       // 如果没有答案数据，返回首页
       wx.navigateBack();
     }
   }
   ```

### 总结与最佳实践

在微信小程序开发中，页面间传递数据的推荐做法：

1. **简单数据**：
   - 数字、短文本等简单数据可以使用 URL 参数传递
   - 例如：`wx.navigateTo({ url: '/pages/detail/detail?id=123' })`

2. **复杂数据**：
   - JSON 对象、长文本、包含特殊字符的内容应避免通过 URL 传递
   - 使用全局变量 `app.globalData` 存储和获取
   - 或考虑使用本地缓存 `wx.setStorageSync`/`wx.getStorageSync`

3. **安全检查**：
   - 在获取数据时始终添加空值检查
   - 为异常情况提供降级处理方案（如跳回首页）

遵循以上实践可以避免类似 "Trace is not defined" 的渲染层错误，提高小程序的稳定性。

## 问题记录：首页显示答案跳转后返回还显示问题

### 错误描述

点击"揭晓答案"按钮后：
1. 答案先在首页显示
2. 然后跳转到答案页面
3. 从答案页面返回首页后，首页仍然显示之前的答案

### 问题原因

在原来的代码中，存在两个相关的状态管理问题：

1. **状态设置时机不正确**：
   - 在跳转到答案页面前，首页就设置了`showAnswer: true`并更新了本地状态中的答案
   ```javascript
   this.setData({
     currentAnswer: answer,
     showAnswer: true,  // 设置首页显示答案
     isThinking: false,
     btnText: '再来一次',
     isRareAnswer: isRare
   });
   ```

2. **缺少页面状态重置**：
   - 没有在页面的`onShow`生命周期中重置状态
   - 导致从答案页面返回首页时，之前设置的状态继续保留

### 解决方案

1. **移除跳转前的状态更新**：
   - 在`onTapGetAnswer`函数中，移除设置`showAnswer: true`和`currentAnswer`的代码
   - 保持"思考中"的状态直到跳转
   ```javascript
   // 不再设置以下状态
   // this.setData({
   //   currentAnswer: answer,
   //   showAnswer: true,
   //   isThinking: false,
   //   btnText: '再来一次',
   //   isRareAnswer: isRare
   // });
   ```

2. **添加`onShow`生命周期函数**：
   - 在页面显示时重置状态，确保返回首页时不显示之前的答案
   ```javascript
   onShow() {
     // 重置页面状态
     this.setData({
       showAnswer: false,
       isThinking: false,
       btnText: '揭晓答案'
     });
   }
   ```

### 总结与最佳实践

小程序页面状态管理的最佳实践：

1. **页面状态隔离**：
   - 每个页面只管理和显示自己的状态
   - 当需要在不同页面间共享数据时，使用全局数据而非依赖页面栈中的状态保留

2. **生命周期管理**：
   - 使用`onLoad`设置初始状态
   - 使用`onShow`重置或刷新状态，特别是在页面可能被多次访问的情况下
   - 使用`onHide`或`onUnload`清理资源或保存状态

3. **合理的状态转换**：
   - 只在恰当的时机更新状态
   - 避免过早设置可能造成用户体验问题的状态

## 问题记录：震动反馈时机不当

### 错误描述

在用户体验中的问题：
1. 用户点击"揭晓答案"按钮
2. 首页会先震动反馈
3. 然后才跳转到答案页面
4. 这使得震动反馈与答案呈现不同步，体验不连贯

### 问题原因

问题包含两个方面：

1. **首页显式震动代码**：
   ```javascript
   // 震动反馈
   wx.vibrateShort();
   
   // 将答案保存到全局数据
   const app = getApp();
   // ...跳转代码
   ```

2. **微信小程序按钮默认震动行为**：
   - 微信小程序的按钮（button组件）在点击时会有默认的触感反馈
   - 即使移除了显式的震动调用代码，按钮仍可能触发系统默认的震动反馈

### 解决方案

综合解决方案需要同时处理这两个方面：

1. **从首页移除震动反馈代码**：
   - 删除 `index.js` 中的 `wx.vibrateShort()` 调用

2. **在答案页面添加震动反馈**：
   - 在 `answer.js` 的 `onLoad` 函数中添加震动
   ```javascript
   onLoad() {
     // 从全局数据获取答案信息
     const app = getApp();
     const answer = app.globalData.currentAnswer;
     const isRare = app.globalData.isRareAnswer;

     if (answer) {
       this.setData({
         currentAnswer: answer,
         isRareAnswer: isRare
       });
       
       // 添加震动反馈，与答案呈现同步
       wx.vibrateShort();
     } else {
       // 如果没有答案数据，返回首页
       wx.navigateBack();
     }
   }
   ```

3. **禁用按钮默认震动行为**：
   - 在首页WXML中，为按钮添加`feedback-type="none"`属性
   - 这会禁用按钮的默认震动反馈行为
   ```xml
   <button class="gradient-btn {{isThinking ? 'disabled' : ''}}" 
           bindtap="onTapGetAnswer" 
           disabled="{{isThinking}}"
           hover-start-time="0"
           feedback-type="none">
     {{btnText}}
   </button>
   ```

### 总结与最佳实践

关于微信小程序交互反馈的最佳实践：

1. **控制默认交互行为**：
   - 了解组件的默认行为（如按钮的自动反馈）
   - 使用正确的属性（如`feedback-type="none"`）来控制默认行为
   - 设置`hover-start-time="0"`可以减少默认视觉反馈的延迟

2. **精确控制反馈时机**：
   - 将震动等反馈放在最合适的时刻
   - 确保反馈与用户看到的视觉变化同步

3. **一致的用户体验**：
   - 避免多次重复的震动反馈
   - 确保所有反馈都有明确的意义和目的 