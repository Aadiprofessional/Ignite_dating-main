export type CityOptionGroup = {
  label: string;
  options: string[];
};

export const CHINA_CITY_DATA_EN = {
  Municipalities: ["Beijing", "Tianjin", "Shanghai", "Chongqing"],
  Provinces: {
    Heilongjiang: ["Harbin", "Qiqihar", "Jixi", "Hegang", "Shuangyashan", "Daqing", "Yichun", "Jiamusi", "Qitaihe", "Mudanjiang", "Heihe", "Suihua", "Daxing'anling Prefecture"],
    Jilin: ["Changchun", "Jilin City", "Siping", "Liaoyuan", "Tonghua", "Baishan", "Songyuan", "Baicheng", "Yanbian Korean Autonomous Prefecture"],
    Liaoning: ["Shenyang", "Dalian", "Anshan", "Fushun", "Benxi", "Dandong", "Jinzhou", "Yingkou", "Fuxin", "Liaoyang", "Panjin", "Tieling", "Chaoyang", "Huludao"],
    Hebei: ["Shijiazhuang", "Tangshan", "Qinhuangdao", "Handan", "Xingtai", "Baoding", "Zhangjiakou", "Chengde", "Cangzhou", "Langfang", "Hengshui"],
    Henan: ["Zhengzhou", "Kaifeng", "Luoyang", "Pingdingshan", "Anyang", "Hebi", "Xinxiang", "Jiaozuo", "Puyang", "Xuchang", "Luohe", "Sanmenxia", "Nanyang", "Shangqiu", "Xinyang", "Zhoukou", "Zhumadian", "Jiyuan"],
    Shandong: ["Jinan", "Qingdao", "Zibo", "Zaozhuang", "Dongying", "Yantai", "Weifang", "Jining", "Tai'an", "Weihai", "Rizhao", "Linyi", "Dezhou", "Liaocheng", "Binzhou", "Heze"],
    Shanxi: ["Taiyuan", "Datong", "Yangquan", "Changzhi", "Jincheng", "Shuozhou", "Jinzhong", "Yuncheng", "Xinzhou", "Linfen", "Lüliang"],
    Shaanxi: ["Xi'an", "Tongchuan", "Baoji", "Xianyang", "Weinan", "Yan'an", "Hanzhong", "Yulin", "Ankang", "Shangluo"],
    Gansu: ["Lanzhou", "Jiayuguan", "Jinchang", "Baiyin", "Tianshui", "Wuwei", "Zhangye", "Pingliang", "Jiuquan", "Qingyang", "Dingxi", "Longnan", "Linxia Hui Autonomous Prefecture", "Gannan Tibetan Autonomous Prefecture"],
    Qinghai: ["Xining", "Haidong", "Haibei Tibetan Autonomous Prefecture", "Huangnan Tibetan Autonomous Prefecture", "Hainan Tibetan Autonomous Prefecture", "Golog Tibetan Autonomous Prefecture", "Yushu Tibetan Autonomous Prefecture", "Haixi Mongol and Tibetan Autonomous Prefecture"],
    Sichuan: ["Chengdu", "Zigong", "Panzhihua", "Luzhou", "Deyang", "Mianyang", "Guangyuan", "Suining", "Neijiang", "Leshan", "Nanchong", "Meishan", "Yibin", "Guang'an", "Dazhou", "Ya'an", "Bazhong", "Ziyang", "Aba Tibetan and Qiang Autonomous Prefecture", "Garzê Tibetan Autonomous Prefecture", "Liangshan Yi Autonomous Prefecture"],
    Guizhou: ["Guiyang", "Liupanshui", "Zunyi", "Anshun", "Bijie", "Tongren", "Qianxinan Buyei and Miao Autonomous Prefecture", "Qiandongnan Miao and Dong Autonomous Prefecture", "Qiannan Buyei and Miao Autonomous Prefecture"],
    Yunnan: ["Kunming", "Qujing", "Yuxi", "Baoshan", "Zhaotong", "Lijiang", "Pu'er", "Lincang", "Chuxiong Yi Autonomous Prefecture", "Honghe Hani and Yi Autonomous Prefecture", "Wenshan Zhuang and Miao Autonomous Prefecture", "Xishuangbanna Dai Autonomous Prefecture", "Dali Bai Autonomous Prefecture", "Dehong Dai and Jingpo Autonomous Prefecture", "Nujiang Lisu Autonomous Prefecture", "Diqing Tibetan Autonomous Prefecture"],
    Zhejiang: ["Hangzhou", "Ningbo", "Wenzhou", "Jiaxing", "Huzhou", "Shaoxing", "Jinhua", "Quzhou", "Zhoushan", "Taizhou", "Lishui"],
    Jiangsu: ["Nanjing", "Wuxi", "Xuzhou", "Changzhou", "Suzhou", "Nantong", "Lianyungang", "Huai'an", "Yancheng", "Yangzhou", "Zhenjiang", "Taizhou", "Suqian"],
    Jiangxi: ["Nanchang", "Jingdezhen", "Pingxiang", "Jiujiang", "Xinyu", "Yingtan", "Ganzhou", "Ji'an", "Yichun", "Fuzhou", "Shangrao"],
    Anhui: ["Hefei", "Wuhu", "Bengbu", "Huainan", "Ma'anshan", "Huaibei", "Tongling", "Anqing", "Huangshan", "Chuzhou", "Fuyang", "Suzhou", "Lu'an", "Bozhou", "Chizhou", "Xuancheng"],
    Fujian: ["Fuzhou", "Xiamen", "Putian", "Sanming", "Quanzhou", "Zhangzhou", "Nanping", "Longyan", "Ningde"],
    Hunan: ["Changsha", "Zhuzhou", "Xiangtan", "Hengyang", "Shaoyang", "Yueyang", "Changde", "Zhangjiajie", "Yiyang", "Chenzhou", "Yongzhou", "Huaihua", "Loudi", "Xiangxi Tujia and Miao Autonomous Prefecture"],
    Hubei: ["Wuhan", "Huangshi", "Shiyan", "Yichang", "Xiangyang", "Ezhou", "Jingmen", "Xiaogan", "Jingzhou", "Huanggang", "Xianning", "Suizhou", "Enshi Tujia and Miao Autonomous Prefecture", "Xiantao", "Qianjiang", "Tianmen", "Shennongjia Forestry District"],
    Guangdong: ["Guangzhou", "Shaoguan", "Shenzhen", "Zhuhai", "Shantou", "Foshan", "Jiangmen", "Zhanjiang", "Maoming", "Zhaoqing", "Huizhou", "Meizhou", "Shanwei", "Heyuan", "Yangjiang", "Qingyuan", "Dongguan", "Zhongshan", "Chaozhou", "Jieyang", "Yunfu"],
    Hainan: ["Haikou", "Sanya", "Sansha", "Danzhou", "Wuzhishan", "Wenchang", "Qionghai", "Wanning", "Dongfang", "Ding'an County", "Tunchang County", "Chengmai County", "Lingao County", "Baisha Li Autonomous County", "Changjiang Li Autonomous County", "Ledong Li Autonomous County", "Lingshui Li Autonomous County", "Baoting Li and Miao Autonomous County", "Qiongzhong Li and Miao Autonomous County"],
  },
  "Autonomous Regions": {
    "Inner Mongolia": ["Hohhot", "Baotou", "Wuhai", "Chifeng", "Tongliao", "Ordos", "Hulunbuir", "Bayannur", "Ulanqab", "Hinggan League", "Xilingol League", "Alxa League"],
    Guangxi: ["Nanning", "Liuzhou", "Guilin", "Wuzhou", "Beihai", "Fangchenggang", "Qinzhou", "Guigang", "Yulin", "Baise", "Hezhou", "Hechi", "Laibin", "Chongzuo"],
    Ningxia: ["Yinchuan", "Shizuishan", "Wuzhong", "Guyuan", "Zhongwei"],
    Xinjiang: ["Ürümqi", "Karamay", "Turpan", "Hami", "Changji Hui Autonomous Prefecture", "Bortala Mongol Autonomous Prefecture", "Bayingolin Mongol Autonomous Prefecture", "Aksu Prefecture", "Kizilsu Kirghiz Autonomous Prefecture", "Kashgar Prefecture", "Hotan Prefecture", "Ili Kazakh Autonomous Prefecture", "Tacheng Prefecture", "Altay Prefecture", "Shihezi", "Aral", "Tumxuk", "Wujiaqu", "Beitun"],
    Tibet: ["Lhasa", "Shigatse", "Chamdo", "Nyingchi", "Shannan", "Nagqu", "Ngari Prefecture"],
  },
  "Special Administrative Regions": ["Hong Kong", "Macau"],
} as const;

const provinceGroups = Object.entries(CHINA_CITY_DATA_EN.Provinces).map(([province, cities]) => ({
  label: `Province · ${province}`,
  options: [...cities],
}));

const autonomousRegionGroups = Object.entries(CHINA_CITY_DATA_EN["Autonomous Regions"]).map(([region, cities]) => ({
  label: `Autonomous Region · ${region}`,
  options: [...cities],
}));

export const CHINA_CITY_OPTION_GROUPS_EN: CityOptionGroup[] = [
  {
    label: "Municipalities",
    options: [...CHINA_CITY_DATA_EN.Municipalities],
  },
  ...provinceGroups,
  ...autonomousRegionGroups,
  {
    label: "Special Administrative Regions",
    options: [...CHINA_CITY_DATA_EN["Special Administrative Regions"]],
  },
];
