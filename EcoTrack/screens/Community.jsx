import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
  Share
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Replace alias with relative path
import { useAppTheme } from "../android/app/utils/theme";

// --- FIREBASE SETUP (Uncomment and configure to use real backend) ---
/*
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, query, where, onSnapshot, 
  updateDoc, arrayUnion, doc, serverTimestamp, increment 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = { 
  // ... your config here 
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
*/

const Community = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  // --- CUSTOM THEME COLOR ---
  const THEME_GREEN = "#059669"; 

  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'group'
  const [activeTab, setActiveTab] = useState("discover"); // 'discover' or 'my_communities'
  const [groupTab, setGroupTab] = useState("chat"); // 'chat' or 'updates' inside a group
  
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [logImpactModalVisible, setLogImpactModalVisible] = useState(false);
  
  // Form States
  const [newCommName, setNewCommName] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [pendingCommunity, setPendingCommunity] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  // Mock Data (Replace with Firestore logic)
  const [user, setUser] = useState({ uid: "user123", name: "EcoWarrior" });
  
  const [communities, setCommunities] = useState([
    {
      id: "1",
      name: "Zero Waste Living",
      description: "Tips and tricks for a plastic-free life.",
      members: ["user123", "user2"],
      isPrivate: false,
      memberCount: 1240,
      carbonSaved: 5430, // Total kg CO2 saved by community
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: "2",
      name: "Carbon Offsetters",
      description: "Discussions on how to effectively offset carbon.",
      members: ["user5"],
      isPrivate: true,
      password: "123",
      memberCount: 85,
      carbonSaved: 120,
      image: null
    },
    {
      id: "3",
      name: "Local Cleanups",
      description: "Organizing weekly cleanup drives in the city.",
      members: ["user123"],
      isPrivate: false,
      memberCount: 432,
      carbonSaved: 2100,
      image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=2070&auto=format&fit=crop"
    },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to Zero Waste!", senderId: "system", time: "10:00 AM", commId: "1" },
    { id: 2, text: "Has anyone tried bamboo toothbrushes?", senderId: "user2", time: "10:05 AM", commId: "1" },
    { id: 3, text: "Yes! They are great.", senderId: "user123", time: "10:10 AM", commId: "1" },
  ]);

  const [groupUpdates, setGroupUpdates] = useState([
    { id: 1, title: "Weekly Challenge Started!", content: "This week's goal is to reduce plastic usage by 50%.", date: "2h ago", commId: "1", author: "Admin" },
    { id: 2, title: "Community Guidelines", content: "Please be respectful to all members in the chat.", date: "1d ago", commId: "1", author: "Admin" },
    { id: 3, title: "Meetup Cancelled", content: "Due to rain, the cleanup drive is postponed.", date: "3d ago", commId: "3", author: "Admin" },
  ]);

  // Pre-defined actions to prevent false data entry
  const impactActions = [
    { id: 'bike', label: 'Biked Commute', icon: 'bike', value: 2.5, color: '#3B82F6' }, // 2.5kg saved
    { id: 'veg', label: 'Veg Meal', icon: 'food-apple', value: 1.5, color: '#10B981' }, // 1.5kg saved
    { id: 'recycle', label: 'Recycled', icon: 'recycle', value: 0.5, color: '#F59E0B' }, // 0.5kg saved
    { id: 'transit', label: 'Public Transit', icon: 'bus', value: 1.8, color: '#8B5CF6' }, // 1.8kg saved
  ];

  const flatListRef = useRef(null);

  // --- HANDLERS ---

  const handleCreateCommunity = () => {
    if (!newCommName.trim()) return;

    const newCommunity = {
      id: Date.now().toString(),
      name: newCommName,
      description: newCommDesc,
      members: [user.uid],
      isPrivate: isPrivate,
      password: isPrivate ? password : null,
      memberCount: 1,
      carbonSaved: 0,
      image: null, 
    };

    setCommunities([newCommunity, ...communities]);
    setModalVisible(false);
    resetForm();
    Alert.alert("Success", "Community created successfully!");
  };

  const resetForm = () => {
    setNewCommName("");
    setNewCommDesc("");
    setIsPrivate(false);
    setPassword("");
  };

  const handleJoinRequest = (community) => {
    if (community.members.includes(user.uid)) {
      enterCommunity(community);
    } else {
      if (community.isPrivate) {
        setPendingCommunity(community);
        setAccessModalVisible(true);
      } else {
        joinCommunity(community);
      }
    }
  };

  const joinCommunity = (community) => {
    const updatedList = communities.map(c => {
      if (c.id === community.id) {
        return { ...c, members: [...c.members, user.uid], memberCount: c.memberCount + 1 };
      }
      return c;
    });
    setCommunities(updatedList);
    enterCommunity({ ...community, members: [...community.members, user.uid] });
  };

  const verifyAccessCode = () => {
    if (accessCode === pendingCommunity.password) {
      joinCommunity(pendingCommunity);
      setAccessModalVisible(false);
      setAccessCode("");
      setPendingCommunity(null);
    } else {
      Alert.alert("Error", "Incorrect Access Code");
    }
  };

  const enterCommunity = (community) => {
    setActiveCommunity(community);
    setGroupTab("chat");
    setCurrentView("group");
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave ${activeCommunity?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            const updatedList = communities.map(c => {
              if (c.id === activeCommunity.id) {
                return {
                  ...c,
                  members: c.members.filter(m => m !== user.uid),
                  memberCount: c.memberCount - 1
                };
              }
              return c;
            });
            setCommunities(updatedList);
            setActiveCommunity(null);
            setCurrentView("list");
          }
        }
      ]
    );
  };

  const handleInvite = async () => {
    try {
      const result = await Share.share({
        message: `Join my group "${activeCommunity.name}" on GreenComm! We have saved ${activeCommunity.carbonSaved}kg of CO2 together! Use code: ${activeCommunity.id}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const handleLogAction = (action) => {
    // 1. Update Local State
    const updatedCommunities = communities.map(c => {
        if (c.id === activeCommunity.id) {
            return { ...c, carbonSaved: (c.carbonSaved || 0) + action.value };
        }
        return c;
    });
    setCommunities(updatedCommunities);
    
    // Update active community view immediately
    setActiveCommunity(prev => ({ ...prev, carbonSaved: (prev.carbonSaved || 0) + action.value }));

    // 2. Add a system message to chat (Social Proof)
    const logMessage = {
        id: Date.now(),
        text: `🌱 ${user.name} logged: ${action.label} (-${action.value}kg CO₂)`,
        senderId: "system",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        commId: activeCommunity.id
    };
    setMessages([...messages, logMessage]);

    setLogImpactModalVisible(false);
    
    // Firestore: await updateDoc(doc(db, 'communities', activeCommunity.id), { carbonSaved: increment(action.value) });
    Alert.alert("Impact Logged!", `You contributed ${action.value}kg CO₂ reduction to the group.`);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: messageInput,
      senderId: user.uid,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commId: activeCommunity.id
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  // --- RENDERERS ---

  const renderHeader = () => {
    if (currentView === "group") {
      return (
        <View style={{ height: 240, width: '100%' }}>
            <ImageBackground 
                source={activeCommunity?.image ? { uri: activeCommunity.image } : null}
                style={{ width: '100%', height: '100%', justifyContent: 'space-between' }}
                imageStyle={{ opacity: activeCommunity?.image ? 1 : 0 }}
            >
                {!activeCommunity?.image && (
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: THEME_GREEN }} />
                )}
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' }} />
                
                {/* Top Bar */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: insets.top + 10 }}>
                    <TouchableOpacity onPress={() => setCurrentView("list")} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 }}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                         <TouchableOpacity onPress={handleInvite} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 }}>
                            <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLeaveGroup} style={{ padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: 20 }}>
                            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Community Stats Card */}
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <View>
                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 5 }}>
                                {activeCommunity?.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <MaterialCommunityIcons name="account-group" size={16} color="#ddd" />
                                <Text style={{ color: '#ddd', marginLeft: 5, fontWeight: '500' }}>
                                    {activeCommunity?.memberCount} Members
                                </Text>
                            </View>
                        </View>
                        
                        {/* Carbon Counter */}
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, alignItems: 'center', backdropFilter: 'blur(10px)' }}>
                             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                 <MaterialCommunityIcons name="leaf" size={20} color="#4ADE80" />
                                 <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 4 }}>
                                    {activeCommunity?.carbonSaved?.toFixed(1) || 0}
                                 </Text>
                                 <Text style={{ color: '#eee', fontSize: 10, marginLeft: 2, marginTop: 6 }}>kg</Text>
                             </View>
                             <Text style={{ color: '#ddd', fontSize: 10 }}>Total Saved</Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
      );
    }
    
    return (
        <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 10, paddingBottom: 15 }}>
          <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
            GreenComm 🌍
          </Text>
          <Text style={{ fontSize: 14, color: colors.secondary }}>
            Discover communities & reduce footprints
          </Text>
        </View>
    );
  };

  const renderTabSelector = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 4,
        }}
      >
        {[
          { id: "discover", label: "Discover", icon: "compass-outline" },
          { id: "my_communities", label: "My Communities", icon: "account-group-outline" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor:
                activeTab === tab.id ? THEME_GREEN : "transparent",
            }}
          >
            <MaterialCommunityIcons 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.id ? (isDark ? "#000" : "#fff") : colors.secondary} 
                style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color:
                  activeTab === tab.id
                    ? isDark
                      ? "#000"
                      : "#fff"
                    : colors.secondary,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGroupTabSelector = () => (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 0, backgroundColor: colors.surface }}>
      {['chat', 'updates'].map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setGroupTab(tab)}
          style={{
            flex: 1,
            paddingVertical: 15,
            alignItems: 'center',
            borderBottomWidth: 3,
            borderBottomColor: groupTab === tab ? THEME_GREEN : 'transparent'
          }}
        >
          <Text style={{ 
            fontWeight: groupTab === tab ? '700' : '500',
            color: groupTab === tab ? THEME_GREEN : colors.secondary,
            fontSize: 14,
            textTransform: 'capitalize'
          }}>
            {tab === 'updates' ? '📢 Admin Updates' : '💬 Group Chat'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCommunityList = () => {
    const displayedCommunities = activeTab === 'discover' 
        ? communities 
        : communities.filter(c => c.members.includes(user.uid));

    return (
      <FlatList 
        data={displayedCommunities}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <MaterialCommunityIcons name="leaf-off" size={50} color={colors.secondary} />
                <Text style={{ color: colors.secondary, marginTop: 10 }}>No communities found here.</Text>
            </View>
        }
        renderItem={({ item }) => {
          const isJoined = item.members.includes(user.uid);
          return (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 0,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden'
              }}
            >
              <View style={{ height: 100, backgroundColor: THEME_GREEN + '20' }}>
                 {item.image ? (
                    <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                 ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.secondary + '10' }}>
                         <MaterialCommunityIcons name={item.isPrivate ? "lock" : "earth"} size={40} color={colors.secondary + '40'} />
                    </View>
                 )}
                 <View style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
                     <MaterialCommunityIcons name="leaf" size={12} color="#4ADE80" />
                     <Text style={{ color: '#fff', fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>{item.carbonSaved || 0} kg</Text>
                 </View>
              </View>

              <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}>
                            {item.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.secondary, marginTop: 4 }} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginTop: 16 }}>
                    <Text style={{ fontSize: 12, color: colors.secondary }}>
                      <MaterialCommunityIcons name="account-multiple" size={12} /> {item.memberCount} Members
                    </Text>
                    
                    <TouchableOpacity
                      onPress={() => handleJoinRequest(item)}
                      style={{
                        backgroundColor: isJoined ? colors.surface : THEME_GREEN,
                        borderWidth: isJoined ? 1 : 0,
                        borderColor: isJoined ? THEME_GREEN : 'transparent',
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ 
                          color: isJoined ? THEME_GREEN : (isDark ? "#000" : "#fff"), 
                          fontWeight: "600", fontSize: 13 
                      }}>
                        {isJoined ? "Open" : "Join"}
                      </Text>
                    </TouchableOpacity>
                  </View>
              </View>
            </View>
          );
        }}
      />
    );
  };

  const renderChatTab = () => {
    const chatMessages = messages.filter(m => m.commId === activeCommunity.id);
    
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={chatMessages}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.secondary, marginTop: 20 }}>
              No messages yet. Start the conversation!
            </Text>
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === user.uid;
            const isSystem = item.senderId === "system";
            
            if (isSystem) {
                return (
                    <View style={{ alignSelf: 'center', marginVertical: 10, paddingHorizontal: 15, paddingVertical: 5, backgroundColor: THEME_GREEN + '15', borderRadius: 15 }}>
                        <Text style={{ color: THEME_GREEN, fontSize: 12, fontWeight: '500' }}>{item.text}</Text>
                    </View>
                )
            }

            return (
              <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginBottom: 12, maxWidth: '80%' }}>
                <View style={{ 
                    backgroundColor: isMe ? THEME_GREEN : colors.surface,
                    padding: 12,
                    borderRadius: 16,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderTopLeftRadius: isMe ? 16 : 4,
                    borderWidth: isMe ? 0 : 1,
                    borderColor: colors.border
                }}>
                    <Text style={{ color: isMe ? '#fff' : colors.primary, fontSize: 15 }}>{item.text}</Text>
                </View>
                <Text style={{ 
                    color: colors.secondary, fontSize: 10, marginTop: 4, 
                    alignSelf: isMe ? 'flex-end' : 'flex-start' 
                }}>
                    {item.time}
                </Text>
              </View>
            );
          }}
        />
        
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
            <View style={{ 
                flexDirection: 'row', padding: 15, backgroundColor: colors.background, 
                borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' 
            }}>
                {/* Log Action Button */}
                <TouchableOpacity 
                    onPress={() => setLogImpactModalVisible(true)}
                    style={{ marginRight: 10, padding: 10, backgroundColor: THEME_GREEN + '20', borderRadius: 25 }}
                >
                    <MaterialCommunityIcons name="leaf" size={24} color={THEME_GREEN} />
                </TouchableOpacity>

                <TextInput 
                    style={{ 
                        flex: 1, backgroundColor: colors.surface, borderRadius: 25, 
                        paddingHorizontal: 20, paddingVertical: 10, color: colors.primary,
                        borderWidth: 1, borderColor: colors.border, marginRight: 10, height: 45
                    }}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.secondary}
                    value={messageInput}
                    onChangeText={setMessageInput}
                />
                <TouchableOpacity 
                    onPress={handleSendMessage}
                    style={{ 
                        width: 45, height: 45, borderRadius: 25, backgroundColor: THEME_GREEN, 
                        justifyContent: 'center', alignItems: 'center' 
                    }}
                >
                    <MaterialCommunityIcons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </View>
    );
  };

  const renderUpdatesTab = () => {
    const updates = groupUpdates.filter(u => u.commId === activeCommunity.id);

    return (
      <FlatList
        data={updates}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
             <MaterialCommunityIcons name="bullhorn-outline" size={40} color={colors.secondary} />
             <Text style={{ color: colors.secondary, marginTop: 10 }}>No updates from admins yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ 
            backgroundColor: colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: THEME_GREEN,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="shield-check" size={16} color={THEME_GREEN} />
                <Text style={{ color: THEME_GREEN, fontWeight: 'bold', marginLeft: 4, fontSize: 12 }}>ADMIN UPDATE</Text>
              </View>
              <Text style={{ color: colors.secondary, fontSize: 12 }}>{item.date}</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 6 }}>{item.title}</Text>
            <Text style={{ fontSize: 14, color: colors.primary, lineHeight: 20 }}>{item.content}</Text>
          </View>
        )}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={{ paddingTop: currentView === 'group' ? 0 : insets.top, flex: 1 }}>
        {renderHeader()}
        
        {currentView === "list" ? (
          <>
            {renderTabSelector()}
            {renderCommunityList()}
            
            {/* Create Group Bar */}
            <View style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              padding: 20, 
              backgroundColor: 'transparent' 
            }}>
              <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                      width: '100%',
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: THEME_GREEN,
                      flexDirection: 'row',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      elevation: 5, 
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3, 
                      shadowRadius: 4.65,
                  }}
              >
                  <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Create a Group</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            {renderGroupTabSelector()}
            {groupTab === 'chat' ? renderChatTab() : renderUpdatesTab()}
          </View>
        )}
      </View>

      {/* --- CREATE MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: '60%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>New Community</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <MaterialCommunityIcons name="close" size={24} color={colors.secondary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label(colors)}>Community Name</Text>
                <TextInput 
                    style={styles.input(colors)} 
                    placeholder="e.g. Plastic Free Life" 
                    placeholderTextColor={colors.secondary}
                    value={newCommName} onChangeText={setNewCommName}
                />

                <Text style={styles.label(colors)}>Description</Text>
                <TextInput 
                    style={[styles.input(colors), { height: 80, textAlignVertical: 'top' }]} 
                    placeholder="What is this group about?" 
                    placeholderTextColor={colors.secondary}
                    multiline
                    value={newCommDesc} onChangeText={setNewCommDesc}
                />

                <TouchableOpacity 
                    onPress={() => setIsPrivate(!isPrivate)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 15, backgroundColor: colors.surface, borderRadius: 12 }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>Private Community</Text>
                        <Text style={{ color: colors.secondary, fontSize: 12 }}>Requires a password to join</Text>
                    </View>
                    <MaterialCommunityIcons 
                        name={isPrivate ? "toggle-switch" : "toggle-switch-off-outline"} 
                        size={40} color={isPrivate ? THEME_GREEN : colors.secondary} 
                    />
                </TouchableOpacity>

                {isPrivate && (
                    <>
                        <Text style={styles.label(colors)}>Set Password</Text>
                        <TextInput 
                            style={styles.input(colors)} 
                            placeholder="Secret Code" 
                            placeholderTextColor={colors.secondary}
                            secureTextEntry
                            value={password} onChangeText={setPassword}
                        />
                    </>
                )}

                <TouchableOpacity 
                    onPress={handleCreateCommunity}
                    style={{ backgroundColor: THEME_GREEN, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create Community</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* --- ACCESS MODAL --- */}
      <Modal visible={accessModalVisible} animationType="fade" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 10, textAlign: 'center' }}>
                    Private Community 🔒
                </Text>
                <Text style={{ color: colors.secondary, textAlign: 'center', marginBottom: 20 }}>
                    Enter the access code to join {pendingCommunity?.name}.
                </Text>
                
                <TextInput 
                    style={styles.input(colors)} 
                    placeholder="Access Code" 
                    placeholderTextColor={colors.secondary}
                    secureTextEntry
                    value={accessCode} onChangeText={setAccessCode}
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity 
                        onPress={() => setAccessModalVisible(false)}
                        style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
                    >
                        <Text style={{ color: colors.primary }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={verifyAccessCode}
                        style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: THEME_GREEN, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Join</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* --- LOG IMPACT MODAL --- */}
      <Modal visible={logImpactModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>Log Your Impact 🌍</Text>
                    <TouchableOpacity onPress={() => setLogImpactModalVisible(false)}>
                        <MaterialCommunityIcons name="close" size={24} color={colors.secondary} />
                    </TouchableOpacity>
                </View>
                <Text style={{ color: colors.secondary, marginBottom: 20 }}>
                    What sustainable action did you take today?
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {impactActions.map((action) => (
                        <TouchableOpacity 
                            key={action.id}
                            onPress={() => handleLogAction(action)}
                            style={{ 
                                width: '48%', 
                                backgroundColor: action.color + '15', 
                                padding: 16, 
                                borderRadius: 16, 
                                borderWidth: 1, 
                                borderColor: action.color,
                                alignItems: 'center'
                            }}
                        >
                            <MaterialCommunityIcons name={action.icon} size={32} color={action.color} />
                            <Text style={{ marginTop: 8, fontWeight: 'bold', color: colors.primary }}>{action.label}</Text>
                            <Text style={{ fontSize: 12, color: colors.secondary }}>Saves {action.value}kg CO₂</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = {
    label: (colors) => ({
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 14
    }),
    input: (colors) => ({
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        color: colors.primary,
        marginBottom: 16
    })
};

export default Community;