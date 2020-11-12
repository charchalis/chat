import colorPallet from "./colorPallet";

const styles = {
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center'
    },
    textInput: {
      height: 37,
      margin: 2,
      padding: 10,
      backgroundColor: 'white',
      borderColor: '#9c9c9c',
      borderWidth: 2,
      borderRadius: 15,
    },
    messageButton: {
      flex: 0.2,
      alignSelf: 'stretch',
      margin: 2,
      marginRight: 0,
      borderRadius: 20,
      backgroundColor: colorPallet.color2,
      width: "5%"
    },
    balloon: {
      paddingHorizontal: 10,
      paddingTop: 6,
      paddingBottom: 5,
      borderRadius: 15,
      margin: 1.5
    },
    myText: {
      backgroundColor: colorPallet.color4,
      alignSelf:'flex-end',
      marginLeft: "15%"
    },
    othersText: {
      backgroundColor: colorPallet.color2,
      alignSelf:'flex-start',
      marginRight: "15%"
    },
}

export default styles;