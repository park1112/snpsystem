class ScheduleModel {
  String? oneTimeStart;
  String? twoTimeStart;
  String? threeTimeStart;
  String? fourTimeStart;
  String? dateTime;
  String? place;
  int? oneTimeCount;
  int? twoTimeCount;
  int? threeTimeCount;
  int? fourTimeCount;

  ScheduleModel({
    this.oneTimeStart,
    this.twoTimeStart,
    this.threeTimeStart,
    this.fourTimeStart,
    this.dateTime,
    this.place,
    this.oneTimeCount,
    this.twoTimeCount,
    this.threeTimeCount,
    this.fourTimeCount,
  });

  ScheduleModel.fromJson(Map<String, dynamic> json) {
    oneTimeStart = json['oneTimeStart'];
    twoTimeStart = json['twoTimeStart'];
    threeTimeStart = json['threeTimeStart'];
    fourTimeStart = json['fourTimeStart'];
    dateTime = json['dateTime'];
    place = json['place'];
    oneTimeCount = json['oneTimeCount'];
    twoTimeCount = json['twoTimeCount'];
    threeTimeCount = json['threeTimeCount'];
    fourTimeCount = json['fourTimeCount'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    oneTimeStart = data['oneTimeStart'];
    twoTimeStart = data['twoTimeStart'];
    threeTimeStart = data['threeTimeStart'];
    fourTimeStart = data['fourTimeStart'];
    dateTime = data['dateTime'];
    place = data['place'];
    oneTimeCount = data['oneTimeCount'];
    twoTimeCount = data['twoTimeCount'];
    threeTimeCount = data['threeTimeCount'];
    fourTimeCount = data['fourTimeCount'];
    return data;
  }
}