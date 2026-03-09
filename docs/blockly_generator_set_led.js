/**
 * Blockly Python 代码生成器：hardware_set_led
 * 块类型：Stack Block（堆叠块）
 * 调用：hardware.set_led(pin, state)
 */

Blockly.Python['hardware_set_led'] = function(block) {
  var value_pin = block.getFieldValue('PIN');
  var value_state = Blockly.Python.valueToCode(block, 'STATE', Blockly.Python.ORDER_ATOMIC) || 'False';
  return 'hardware.set_led(' + value_pin + ', ' + value_state + ')\n';
};
