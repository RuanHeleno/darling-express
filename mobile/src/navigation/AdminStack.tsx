import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdminDashboardScreen } from "@/screens/AdminDashboardScreen";
import { OrdersKanbanScreen } from "@/screens/OrdersKanbanScreen";
import { LoyaltyScreen } from "@/screens/LoyaltyScreen";
import { CustomersScreen } from "@/screens/CustomersScreen";
import { ProductsScreen } from "@/screens/ProductsScreen";
import { ProductDetailsScreen } from "@/screens/ProductDetailsScreen";
import { ProductFormScreen } from "@/screens/ProductFormScreen";
import { CustomerDetailsScreen } from "@/screens/CustomerDetailsScreen";
import { CustomerFormScreen } from "@/screens/CustomerFormScreen";
import { OrderDetailsScreen } from "@/screens/OrderDetailsScreen";
import { OrderStatusScreen } from "@/screens/OrderStatusScreen";
import { NavigationGuideScreen } from "@/screens/NavigationGuideScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { NewShipmentScreen } from "@/screens/NewShipmentScreen";
import { LoginScreen } from "@/screens/LoginScreen";

export type AdminStackParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Loyalty: undefined;
  Customers: undefined;
  CustomerDetails: { customerId: string } | undefined;
  CustomerForm: undefined;
  Products: undefined;
  ProductDetails: { productId: string } | undefined;
  ProductForm: undefined;
  OrderDetails: { orderId: string } | undefined;
  OrderStatus: { orderId: string } | undefined;
  NavigationGuide: undefined;
  Settings: undefined;
  NewShipment: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="Orders" component={OrdersKanbanScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="Customers" component={CustomersScreen} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
      <Stack.Screen name="CustomerForm" component={CustomerFormScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
      <Stack.Screen name="NavigationGuide" component={NavigationGuideScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NewShipment" component={NewShipmentScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
