import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { enableScreens } from 'react-native-screens';

enableScreens();
const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What You Want To Create?</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("CaterersForm", {
            formTitle: "Generate Quotation",
            pdfTitle: "Quotation",
          })
        }
      >
        <Text style={styles.buttonText}>Create Quotation</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("CaterersForm", {
            formTitle: "Generate Bill",
            pdfTitle: "Bill",
          })
        }
      >
        <Text style={styles.buttonText}>Create Bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const CaterersForm = ({ route }) => {
  const { formTitle, pdfTitle } = route.params;
  const [form, setForm] = useState({
    name: "",
    address: "",
    mobileNumber: "+91",
    date: new Date(),
    menuItems: [{ itemName: "" }],
    quantityOfTable: "",
    quantityOfChair: "",
    quantityOfPeople: "",
    totalAmount: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (name, value) =>
    setForm({ ...form, [name]: value });
  const addMenuItem = () =>
    setForm({ ...form, menuItems: [...form.menuItems, { itemName: "" }] });

  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px }
            h1 { text-align: center; color: #ED070A; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>${pdfTitle}</h1>
          <p><strong>Name:</strong> ${form.name}</p>
          <p><strong>Address:</strong> ${form.address}</p>
          <p><strong>Mobile Number:</strong> ${form.mobileNumber}</p>
          <p><strong>Date:</strong> ${form.date.toLocaleDateString()}</p>
          <h2>Menu Items</h2>
          <table>
            <tr><th>Item</th><th>Quantity</th></tr>
            ${form.menuItems
              .map(
                (item, index) =>
                  `<tr><td>${index + 1}</td><td>${item.itemName}</td></tr>`
              )
              .join("")}
          </table>
          <p><strong>Total Amount:</strong> ${form.totalAmount}</p>
        </body>
      </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const pdfFileUri = `${FileSystem.documentDirectory}GeneratedDocument.pdf`;
      await FileSystem.moveAsync({ from: uri, to: pdfFileUri });
      await Sharing.shareAsync(pdfFileUri);
      Alert.alert(
        "PDF created",
        "The PDF was successfully created and shared."
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("Error", "An error occurred while creating the PDF.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{formTitle}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(text) => handleInputChange("name", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={form.address}
        onChangeText={(text) => handleInputChange("address", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number (+91XXXXXXXXXX)"
        keyboardType="numeric"
        value={form.mobileNumber}
        onChangeText={(text) => {
          if (text.length <= 13) handleInputChange("mobileNumber", text);
        }}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select Date"
          value={form.date.toLocaleDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setForm({ ...form, date: selectedDate });
          }}
        />
      )}

      <Text style={styles.sectionHeader}>Menu Items</Text>
      {form.menuItems.map((item, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`Item ${index + 1}`}
          value={item.itemName}
          onChangeText={(text) => {
            const updatedItems = form.menuItems.map((it, idx) =>
              idx === index ? { itemName: text } : it
            );
            setForm({ ...form, menuItems: updatedItems });
          }}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={addMenuItem}>
        <Text style={styles.buttonText}>Add Menu Item</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Total Amount"
        keyboardType="numeric"
        value={form.totalAmount}
        onChangeText={(text) => handleInputChange("totalAmount", text)}
      />
      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText}>Generate PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="CaterersForm" component={CaterersForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
    marginVertical: 15,
  },
  button: {
    backgroundColor: "#db5c5c",
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default App;
