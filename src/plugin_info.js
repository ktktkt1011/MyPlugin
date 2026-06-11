((PLUGIN_ID) => {
  "use strict";
  window.srplugin_infomation = window.srplugin_infomation || [];
  window.srplugin_infomation[PLUGIN_ID] = {
    // プラグインNo
    PluginNo: 101,
    // プラグイン名
    PluginName: "法人番号検索プラグイン",
    // プラグイン設定
    PluginConfig: kintone.plugin.app.getConfig(PLUGIN_ID),
    // プラグイン使用期限日
    PluginDuedate: "99999999",
  };
})(kintone.$PLUGIN_ID);
