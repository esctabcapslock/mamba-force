

let setting  = {
  is_mambaforce_newwindows : false,
  mamba_forge_value : false,
  save_chart_to_storage : false,
  cart: [],
  popup_open: true,
  always_add_to_cart : true,
  click_to_copy: true
}

let global = {
  bc: undefined
}

function setup(){
  // Check browser restart
  if (document.cookie.includes('mambaforce_newwindows')){
    setting.is_mambaforce_newwindows = false
  }else{
    setting.is_mambaforce_newwindows = true;
    document.cookie = document.cookie+';mambaforce_newwindows'
  }

  let mamba_forge_value = (localStorage.getItem('mamba_forge_value'))
  if (mamba_forge_value==null){
    setting.mamba_forge_value = true; 
    localStorage.setItem('mamba_forge_value', setting.mamba_forge_value)
    // null, undefined, 0, false
  } else{
    setting.mamba_forge_value = Boolean(mamba_forge_value);
  }
  

  
  if (setting.mamba_forge_value) {
    change_to_mamba()
  }

  let save_chart_to_storage = (localStorage.getItem('save_chart_to_storage'))
  if (save_chart_to_storage==null){
    setting.save_chart_to_storage = false; // Default - Delete chart when browser re-start 
    localStorage.setItem('save_chart_to_storage', setting.save_chart_to_storage)
    // null, undefined, 0, false
  } else{
    setting.save_chart_to_storage = Boolean(save_chart_to_storage);
  }

  if ( setting.save_chart_to_storage  == false && setting.is_mambaforce_newwindows == true){ // 
    setting.cart = []
    localStorage.removeItem('cart_value')
  }else{
    let v = localStorage.getItem('cart_value')
    if (v != null){
      setting.cart = v.split('\n')
    }
  }


  let popup_open = localStorage.getItem('popup_open')
  if (popup_open==null){
    setting.popup_open = false; // Default
    localStorage.setItem('mamba_forge_value', setting.popup_open)
    // null, undefined, 0, false
  } else{
    setting.popup_open = Boolean(popup_open)
  }

  let always_add_to_cart = localStorage.getItem('always_add_to_cart')
  if (always_add_to_cart==null){
    setting.always_add_to_cart = true; // Default
    localStorage.setItem('mamba_forge_value', setting.always_add_to_cart)
    // null, undefined, 0, false
  } else{
    setting.always_add_to_cart = Boolean(always_add_to_cart);
  }

  let click_to_copy = localStorage.getItem('click_to_copy')
  if (click_to_copy==null){
    setting.click_to_copy = true; // Default
    localStorage.setItem('mamba_forge_value', setting.click_to_copy)
    // null, undefined, 0, false
  } else{
    setting.click_to_copy = Boolean(click_to_copy);
  }

  // print_logs()
  
}

function apply_local_storage(){
  localStorage.setItem('mamba_forge_value', setting.mamba_forge_value)
  localStorage.setItem('save_chart_to_storage', setting.save_chart_to_storage)
  if (setting.cart.length){
    localStorage.setItem('cart_value', setting.cart.join('\n'))
  }else{
    localStorage.removeItem('cart_value')
  }
  localStorage.setItem('popup_open', setting.popup_open)
  localStorage.setItem('always_add_to_cart', setting.always_add_to_cart)
  localStorage.setItem('click_to_copy', setting.click_to_copy)


  global.bc.postMessage(setting)
  // print_logs()
}

function setting_by_rciv_data(data){
  let mamba_forge_value = data.mamba_forge_value//Boolean(localStorage.getItem('mamba_forge_value'))
  if (mamba_forge_value!=null)  setting.mamba_forge_value = mamba_forge_value;
  
  let save_chart_to_storage = data.save_chart_to_storage//Boolean(localStorage.getItem('save_chart_to_storage'))
  if (save_chart_to_storage!=null) setting.save_chart_to_storage = save_chart_to_storage;
  
  let v = data.cart //localStorage.getItem('cart_value')
  if (v != null) setting.cart = v
  else setting.cart = []
}



function add_copy_event(){
  const conda = document.getElementsByClassName('panel')[1]
  const codes = conda.getElementsByTagName('code')
  for (let c of codes){    
    c.addEventListener('click',e=>{
      // const txt = e.target.textContent
      const txt = e.target.childNodes[0].textContent
      const txt_dependency = txt.replace(/^(mamba|conda)\s+install\s+/,'')
      if (setting.click_to_copy) {
        copyToClipboard(txt)
        createTooltipBottomElement(c, 'Copied!')
      }
      
      // console.log(e)
      if (e.ctrlKey || e.metaKey || setting.always_add_to_cart){
        console.log(e, txt, setting)
        if (!setting.cart.includes(txt_dependency)){
          setting.cart.push(txt_dependency)
          apply_local_storage()
          print_logs()
        }

        if (!setting.click_to_copy){
          createTooltipBottomElement(c, 'Added to Cart!')
        }
       
      }
      
    })
}
}

/**
 * If it's false, it's changed to "conda".
 * @param {boolean} is_to_mamba 
 */
function change_to_mamba(is_to_mamba = true){
  const conda = document.getElementsByClassName('panel')[1]
  const codes = conda.getElementsByTagName('code')
  for (let c of codes){    
      if (is_to_mamba) c.textContent =  c.textContent.replace(/^conda\s+/,'mamba ')
      else c.textContent =  c.textContent.replace(/^mamba\s+/,'conda ')
          
  }
}



function print_logs(){
  // out_html = ''
  const copylog_list = document.getElementById('copylog_list');
  copylog_list.innerHTML = ''
  setting.cart.forEach((log,i)=>{
    const div_ele = document.createElement('div')
    div_ele.classList.add('code_wrop')
    const delete_btn = document.createElement('code')
    delete_btn.textContent = '×'
    const index = i;
    delete_btn.addEventListener('click',e=>{
      setting.cart.splice(index, 1)
      apply_local_storage()
      print_logs()
      // div_ele.remove()
    })
    const code_ele = document.createElement('code')
    code_ele.textContent = log
    // createTooltipBottomElement(code_ele, 'copied!')
    div_ele.append(delete_btn)
    div_ele.append(code_ele)
    copylog_list.append(div_ele)

    // add copy
    code_ele.addEventListener('click',e=>{
      copyToClipboard(`${(setting.mamba_forge_value?'mamba':'conda')} install ${e.target.textContent}`)
      // createTooltipBottomElement(code_ele, 'copied!')
    })
  })
}



function copyToClipboard(text) {
    const tempElement = document.createElement('textarea');
    tempElement.value = text;
  
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
  
    document.body.removeChild(tempElement);
  }
  

function createTooltipBottomElement(origEle, yourText) {
    // Tooltip container
    const tooltipContainer = document.createElement("div");
    tooltipContainer.classList.add("mytooltip");
  
    // Tooltip text
    const tooltipText = document.createElement("div");
    tooltipText.classList.add("mytooltiptext");
    tooltipText.textContent = yourText; 
  
    // Tooltip arrow
    const tooltipArrow = document.createElement("div");
    tooltipArrow.classList.add("tooltiptext-arrow");
  
    // Append tooltip text and arrow to the container
    tooltipContainer.appendChild(tooltipText);
    tooltipText.appendChild(tooltipArrow);
  
    // Append the tooltip container to the original element's parent
    origEle.appendChild(tooltipContainer);


    origEle.style.position = 'relative'
    tooltipContainer.style.transform = 'translate(-50%, -50%)'
    tooltipContainer.style.left = '50%'
    tooltipContainer.style.top = '250%'
    tooltipContainer.style.backgroundColor = '#333'
    tooltipContainer.style.color = '#fff'
    tooltipContainer.style.zIndex = '1007'
    tooltipContainer.style.position = 'absolute'
    tooltipContainer.style.fontSize = '14px'
    tooltipContainer.style.fontSize = '.875rem'
    tooltipContainer.style.fontWeight = '400'
    tooltipContainer.style.lineHeight = '1.3'
    tooltipContainer.style.padding = '.75rem'


    tooltipArrow.style.content = ''
    tooltipArrow.style.position = 'absolute'
    tooltipArrow.style.bottom = '100%'
    tooltipArrow.style.left = '50%'
    tooltipArrow.style.marginLeft = '-5px'
    tooltipArrow.style.borderWidth = '5px'
    tooltipArrow.style.borderStyle = 'solid'
    tooltipArrow.style.borderColor = 'transparent transparent #555 transparent'
  
    origEle.addEventListener("mouseout", function () {
    //   tooltipText.style.visibility = "hidden";
    //   tooltipText.style.opacity = 0;
        tooltipContainer.remove()
    });
  
    return tooltipContainer;
  }



function createPannel(){
  const panel_container = document.createElement('div')
  panel_container.classList.add('panel-container')

  panel_container.innerHTML = `

<div class="sliding-panel ${setting.popup_open?'open':''}">
  <div class='slide_btn' >M-f</div>
  <!-- Your content goes here -->
  <h1>mamba-force</h1>
  <!--<p>This is the sliding panel content.</p>-->
  <div class='panel_setting_table'>
    <div class='panel_setting_table_row'>
      <span class='panel_setting_table_cell'>force to mamba</span>
      <span class='panel_setting_table_cell'><label class="switch">
        <input type="checkbox" id="toggleSwitch_mamba_forge_value" checked=${setting.mamba_forge_value}>
        <span class="slider"></span>
      </label></span>
    </div>
    <div class='panel_setting_table_row'>
      <span class='panel_setting_table_cell'>always add to Cart</span>
      <span class='panel_setting_table_cell'><label class="switch">
        <input type="checkbox" id="toggleSwitch_always_add_to_cart" checked=${setting.always_add_to_cart}> 
        <span class="slider"></span>
      </label></span>
    </div>
    <div class='panel_setting_table_row'>
      <span class='panel_setting_table_cell'>click to copy</span>
      <span class='panel_setting_table_cell'><label class="switch">
        <input type="checkbox" id="toggleSwitch_click_to_copy" checked=${setting.click_to_copy}> 
        <span class="slider"></span>
      </label></span>
    </div>
    <!--<div class='panel_setting_table_row'>
      <span class='panel_setting_table_cell'>remove logs when brower restarts</span>
      <span class='panel_setting_table_cell'><label class="switch">
        <input type="checkbox" id="c" checked=${!setting.save_chart_to_storage}> 
        <span class="slider"></span>
      </label></span>
    </div>-->
  </div>
  <!--<button id="closePanelBtn">Close Panel</button>-->
  <hr>
  <div>
    <h3>Package Cart</h3>
    <!--<p>To add package, ctrl./cmd. + click</p>-->
    <div id='copylog_list'>
    </div>
    <button id='copy_whole_logs'>Export Cart</button>
    <button id="btn_clear_logs">Clear Cart</button>
  </div>
</div>
`

  document.body.append(panel_container)
  console.log(panel_container)

  // toggleSwitch_mamba_forge_value toggleSwitch_save_chart_to_storage
document.getElementById('toggleSwitch_mamba_forge_value').addEventListener('change', function() {
  // Toggle your functionality here based on the switch state
  if (this.checked) { // 
    // console.log('Switch is ON');
    change_to_mamba(true)
  } else {
    // console.log('Switch is OFF');
    change_to_mamba(false)
  }
  setting.mamba_forge_value = this.checked
  apply_local_storage()

});

document.getElementById('toggleSwitch_always_add_to_cart').addEventListener('change', function() {
  setting.always_add_to_cart = this.checked
  apply_local_storage()

});
document.getElementById('toggleSwitch_click_to_copy').addEventListener('change', function() {
  setting.click_to_copy = this.checked
  apply_local_storage()

});

// document.getElementById('toggleSwitch_save_chart_to_storage').addEventListener('change', function() {
//   // Toggle your functionality here based on the switch state
//   if (this.checked) { // 
//     // console.log('Switch is ON');
//     // change_to_mamba()
//     setting.save_chart_to_storage = false
//   } else {
//     // console.log('Switch is OFF');
//     setting.save_chart_to_storage = true
//     // change_to_mamba(false)
//   }
//   apply_local_storage()
// });

document.getElementById('btn_clear_logs').addEventListener('click',e=>{
  setting.cart = []
  apply_local_storage()
  print_logs()
})

document.getElementById('copy_whole_logs').addEventListener('click',e=>{
  if (setting.cart.length){
    copyToClipboard(`${(setting.mamba_forge_value?'mamba':'conda')} install ${setting.cart.join(' ')}`)
    createTooltipBottomElement(e.target, 'copied!')
  }else{
    createTooltipBottomElement(e.target, 'nothing to copy')
  }
  
})

  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';


  // CSS rules for the sliding panel
  const cssRules = `

  .panel-container {
    position: relative;
  }

  .sliding-panel {
    position: fixed;
    top: 0;
    right: -330px;
    height: 100vh;
    width: 330px;
    background-color: #f1f1f1;
    padding: 20px;
    transition: right 0.3s ease-in-out;
  }

  .sliding-panel.open {
    right: 0;
  }

  .slide_btn {
    position: absolute;
  left: 0;
  top: 80%;
  transform: translate(-100%, 0%);
  background-color: white;
  padding: 0.75em;
  border: 1px solid black;
}
  

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #43b02a;
}

input:focus + .slider {
  box-shadow: 0 0 1px #43b02a;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.panel_setting_table{
  display: table;
  width: 100%;
}
.panel_setting_table_row{
  display: table-row;
}
.panel_setting_table_cell{
  display: table-cell;
  padding-top: 10px;
}
#copylog_list{
  max-height: 50vh;
  overflow-y: scroll;
  padding: 1em 0;
  transition: all 0.3s ease;
}
.code_wrop{
  overflow-x: scroll;
  padding-bottom: 0.4em;
}
.code_wrop > code:first-child{
  margin-right: 0.4em;
}
#copylog_list code{
  white-space: nowrap;
  font-size: 0.8em;
}
`;

  // Append CSS rules to the style element
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = cssRules;
  } else {
    styleElement.appendChild(document.createTextNode(cssRules));
  }

  // Append the style element to the head of the document
  document.body.appendChild(styleElement);
  console.log(styleElement)

  // const openPanelBtn = document.getElementById('openPanelBtn');
  // const closePanelBtn = document.getElementById('closePanelBtn');
  const slidingPanel = document.querySelector('.sliding-panel');

  // openPanelBtn.addEventListener('click', function () {
  //   slidingPanel.classList.add('open');
  // });

  // closePanelBtn.addEventListener('click', function () {
  //   slidingPanel.classList.remove('open');
  // });

    const panelBtn = document.getElementsByClassName('slide_btn')[0]
    panelBtn.addEventListener('click',e=>{
      if(slidingPanel.classList.contains('open')){
        slidingPanel.classList.remove('open');
      }else{
        slidingPanel.classList.add('open');
      }
      setting.popup_open = slidingPanel.classList.contains('open')
      apply_local_storage()
    })
}


function add_localstorage_evant(){
  document.addEventListener(
    "localDataStorage", e=>{

      console.log('localDataStorage', e)
    })
}

1;
(()=>{
  // ... //
  if (document.getElementsByClassName('panel')[1] == undefined){
    return
  }

  global.bc = new BroadcastChannel("storage_changed");
  global.bc.onmessage = (event) => {
    console.log('bc.onmessage',event, event.data)
    // console.log('bc-message',localStorage.getItem('cart_value').split('\n'))
    setting_by_rciv_data(event.data)
    // apply_local_storage()
    // console.log('bc-message',localStorage.getItem('cart_value').split('\n'))
    print_logs()
    console.log('bc-message',localStorage.getItem('cart_value').split('\n'))
  };
  
  setup()
  createPannel()
  add_copy_event()
  print_logs()

})();
