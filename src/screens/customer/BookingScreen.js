import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius } from '../../theme/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const BookingScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    pickupDate: new Date(),
    pickupTime: new Date(),
    truckType: '',
    specialRequirements: '',
    contactNumber: '',
    estimatedDistance: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTruckType, setSelectedTruckType] = useState(null);
  const [loading, setLoading] = useState(false);

  const truckTypes = [
    {
      id: 1,
      name: 'Freightliner',
      specs: '7L x 4.8W x 4.8H',
      price: '$1599',
      image: '🚛',
    },
    {
      id: 2,
      name: 'Western Star 49',
      specs: 'L x 4.8W x 4.8H',
      price: '$2099',
      image: '🚚',
    },
    {
      id: 3,
      name: 'Peterbilt 589',
      specs: '7L x 4.8W x 4.8H',
      price: '$1799',
      image: '🚛',
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, pickupDate: selectedDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData(prev => ({ ...prev, pickupTime: selectedTime }));
    }
  };

  const handleTruckSelection = (truck) => {
    setSelectedTruckType(truck);
    setFormData(prev => ({ ...prev, truckType: truck.name }));
  };

  const validateForm = () => {
    if (!formData.pickupLocation.trim()) {
      Alert.alert('Error', 'Please enter pickup location');
      return false;
    }
    if (!formData.dropLocation.trim()) {
      Alert.alert('Error', 'Please enter drop location');
      return false;
    }
    if (!selectedTruckType) {
      Alert.alert('Error', 'Please select a truck type');
      return false;
    }
    if (!formData.contactNumber.trim()) {
      Alert.alert('Error', 'Please enter contact number');
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // API call to create booking
      const bookingData = {
        ...formData,
        truckDetails: selectedTruckType,
        userId: 'current-user-id', // This would come from auth context
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Booking Confirmed!',
        'Your booking has been submitted successfully. You will receive a confirmation shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CustomerMain'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Truck Service</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Pickup & Drop Details</Text>
          
          <Input
            label="Pickup Location"
            placeholder="Enter pickup address"
            value={formData.pickupLocation}
            onChangeText={(value) => handleInputChange('pickupLocation', value)}
            leftIcon="location-outline"
          />

          <Input
            label="Drop Location"
            placeholder="Enter destination address"
            value={formData.dropLocation}
            onChangeText={(value) => handleInputChange('dropLocation', value)}
            leftIcon="location-outline"
          />

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.inputLabel}>Pickup Date</Text>
              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>
                  {formatDate(formData.pickupDate)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeItem}>
              <Text style={styles.inputLabel}>Pickup Time</Text>
              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeText}>
                  {formatTime(formData.pickupTime)}
                </Text>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="Contact Number"
            placeholder="Enter your phone number"
            value={formData.contactNumber}
            onChangeText={(value) => handleInputChange('contactNumber', value)}
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Select Truck Type</Text>
          
          <View style={styles.truckTypesContainer}>
            {truckTypes.map((truck) => (
              <TouchableOpacity
                key={truck.id}
                style={[
                  styles.truckTypeCard,
                  selectedTruckType?.id === truck.id && styles.selectedTruckType,
                ]}
                onPress={() => handleTruckSelection(truck)}
              >
                <Text style={styles.truckEmoji}>{truck.image}</Text>
                <View style={styles.truckInfo}>
                  <Text style={styles.truckName}>{truck.name}</Text>
                  <Text style={styles.truckSpecs}>{truck.specs}</Text>
                  <Text style={styles.truckPrice}>{truck.price}</Text>
                </View>
                {selectedTruckType?.id === truck.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Special Requirements (Optional)"
            placeholder="Any special instructions or requirements"
            value={formData.specialRequirements}
            onChangeText={(value) => handleInputChange('specialRequirements', value)}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Estimated Distance (Optional)"
            placeholder="Estimated distance in miles"
            value={formData.estimatedDistance}
            onChangeText={(value) => handleInputChange('estimatedDistance', value)}
            leftIcon="speedometer-outline"
            keyboardType="numeric"
          />

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Date:</Text>
              <Text style={styles.summaryValue}>
                {formatDate(formData.pickupDate)} at {formatTime(formData.pickupTime)}
              </Text>
            </View>
            {selectedTruckType && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Truck Type:</Text>
                  <Text style={styles.summaryValue}>{selectedTruckType.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estimated Cost:</Text>
                  <Text style={styles.summaryValue}>{selectedTruckType.price}</Text>
                </View>
              </>
            )}
          </View>

          <Button
            title="Confirm Booking"
            onPress={handleBooking}
            loading={loading}
            size="large"
            style={styles.bookButton}
          />
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.pickupDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.pickupTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    marginTop: -spacing.lg,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dateTimeItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    minHeight: 44,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.dark,
  },
  truckTypesContainer: {
    marginBottom: spacing.lg,
  },
  truckTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  selectedTruckType: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  truckEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  truckInfo: {
    flex: 1,
  },
  truckName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  truckSpecs: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  truckPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
  },
  bookButton: {
    marginBottom: spacing.xl,
  },
});

export default BookingScreen;
