import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChatEnabledDevice {
  id: string;
  name: string;
  type: string;
  status: string;
  category: string;
  chatEnabled: boolean;
  controllerEnabled: boolean; // New field for controller display
}

interface ChatDeviceContextType {
  chatEnabledDevices: ChatEnabledDevice[];
  updateDeviceChatStatus: (deviceId: string, enabled: boolean) => void;
  updateDeviceControllerStatus: (deviceId: string, enabled: boolean) => void; // New function
  getChatEnabledDevices: () => ChatEnabledDevice[];
  getControllerEnabledDevices: () => ChatEnabledDevice[]; // New function
  isChatEnabled: (deviceId: string) => boolean;
  isControllerEnabled: (deviceId: string) => boolean; // New function
}

const ChatDeviceContext = createContext<ChatDeviceContextType | undefined>(undefined);

export const ChatDeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatEnabledDevices, setChatEnabledDevices] = useState<ChatEnabledDevice[]>([]);

  // Initialize with default devices that have chat and controller enabled
  useEffect(() => {
    const defaultDevices: ChatEnabledDevice[] = [
      {
        id: '1',
        name: 'Living Room TV',
        type: 'wifi',
        status: 'connected',
        category: 'media',
        chatEnabled: true,
        controllerEnabled: true
      },
      {
        id: '2',
        name: 'Smart Thermostat',
        type: 'zigbee',
        status: 'connected',
        category: 'smart-home',
        chatEnabled: true,
        controllerEnabled: false
      },
      {
        id: '3',
        name: 'ESP32 Gacha Controller',
        type: 'wifi',
        status: 'connected',
        category: 'industrial',
        chatEnabled: true,
        controllerEnabled: true
      },
      {
        id: '4',
        name: 'Kitchen Speaker',
        type: 'bluetooth',
        status: 'disconnected',
        category: 'media',
        chatEnabled: false,
        controllerEnabled: false
      },
      {
        id: '5',
        name: 'Industrial Panel A',
        type: 'wifi',
        status: 'connected',
        category: 'industrial',
        chatEnabled: false,
        controllerEnabled: true
      }
    ];
    
    setChatEnabledDevices(defaultDevices);
  }, []);

  const updateDeviceChatStatus = (deviceId: string, enabled: boolean) => {
    setChatEnabledDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, chatEnabled: enabled }
          : device
      )
    );
  };

  const updateDeviceControllerStatus = (deviceId: string, enabled: boolean) => {
    setChatEnabledDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, controllerEnabled: enabled }
          : device
      )
    );
  };

  const getChatEnabledDevices = () => {
    return chatEnabledDevices.filter(device => device.chatEnabled && device.status === 'connected');
  };

  const getControllerEnabledDevices = () => {
    return chatEnabledDevices.filter(device => device.controllerEnabled && device.status === 'connected');
  };

  const isChatEnabled = (deviceId: string) => {
    const device = chatEnabledDevices.find(d => d.id === deviceId);
    return device?.chatEnabled || false;
  };

  const isControllerEnabled = (deviceId: string) => {
    const device = chatEnabledDevices.find(d => d.id === deviceId);
    return device?.controllerEnabled || false;
  };

  return (
    <ChatDeviceContext.Provider value={{
      chatEnabledDevices,
      updateDeviceChatStatus,
      updateDeviceControllerStatus,
      getChatEnabledDevices,
      getControllerEnabledDevices,
      isChatEnabled,
      isControllerEnabled
    }}>
      {children}
    </ChatDeviceContext.Provider>
  );
};

export const useChatDevice = (): ChatDeviceContextType => {
  const context = useContext(ChatDeviceContext);
  if (!context) {
    throw new Error('useChatDevice must be used within a ChatDeviceProvider');
  }
  return context;
};