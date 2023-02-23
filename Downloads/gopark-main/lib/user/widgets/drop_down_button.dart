import 'package:flutter/material.dart';
import 'package:gopark_app/common/provider/model_place_provider.dart';
import 'package:provider/provider.dart';

class DropDownButtonWidget extends StatefulWidget {
  void Function(String?)? onChanged;
  DropDownButtonWidget({required this.onChanged,Key? key}) : super(key: key);

  @override
  State<DropDownButtonWidget> createState() => _DropDownButtonWidgetState();
}

class _DropDownButtonWidgetState extends State<DropDownButtonWidget> {
  @override
  void initState() {
    super.initState();
    final getData = Provider.of<PlaceProvider>(context, listen: false);
    getData.indexCallBack();
  }
  @override
  Widget build(BuildContext context) {
    final getData = Provider.of<PlaceProvider>(context,listen: true);
    List<String> buttonItem = getData.placeNameSave.toList();
    String dropdownValue = getData.dropDownValue;
    return Container(
        child: DropdownButton<String>(
          value: dropdownValue,
          items: buttonItem.map<DropdownMenuItem<String>>((String item){
            return DropdownMenuItem<String>(
              value:item,
              child:Text(item),
            );
          }).toList(), onChanged:widget.onChanged,//(value)=>getData.dropDownChange(value!)),
        ));
  }
}