/**
 * MealHistoryScreen.tsx
 * Netrilens AI — Premium Meal History Screen
 * Production-grade, luxury dark UI
 */

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SectionList,
    TouchableOpacity,
    TextInput,
    Animated,
    PanResponder,
    Dimensions,
    ScrollView,
    StatusBar,
    Platform,
    SafeAreaView,
    Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { deleteMeal, getTodayMeals } from "../src/services/trackingService";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MealEntry {
    id: number;
    food_name: string;
    meal_type: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    consumed_at: string;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

const T = {
    bg: "#070B14",
    surface: "rgba(255,255,255,0.04)",
    elevated: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.08)",
    primary: "#8B5CF6",
    secondary: "#3B82F6",
    highlight: "#A855F7",
    success: "#4ADE80",
    textPrimary: "#FFFFFF",
    textSecondary: "#8B8B9E",
    textDim: "#4A4A5E",
    danger: "#F87171",
    edit: "#38BDF8",
    mealColors: {
        Breakfast: "#F59E0B",
        Lunch: "#3B82F6",
        Dinner: "#8B5CF6",
        Snack: "#4ADE80",
    } as Record<string, string>,
    mealEmoji: {
        Breakfast: "☀️",
        Lunch: "🥗",
        Dinner: "🌙",
        Snack: "🍎",
    } as Record<string, string>,
};

const { width: SW } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

// ─── Mock Data ────────────────────────────────────────────────────────────────



// ─── Utilities ────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getDateLabel(iso: string): string {
    const mealDate = new Date(iso);
    const today = new Date();
    const diffMs = today.setHours(0, 0, 0, 0) - mealDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays === 2) return "2 Days Ago";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
    });
}

function getDateKey(iso: string): string {
    return new Date(iso).toDateString();
}

// ─── Shimmer Component ───────────────────────────────────────────────────────

const Shimmer: React.FC<{
    width: number | `${number}%`;
    height: number;
    radius?: number;
}> = ({
    width,
    height,
    radius = 8,
}) => {
        const shimmerAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        }, []);

        const bgColor = shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"],
        });

        return (
            <Animated.View
                style={{
                    width,
                    height,
                    borderRadius: radius,
                    backgroundColor: bgColor,
                    overflow: "hidden",
                }}
            />
        );
    };

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
    <View style={styles.skeletonCard}>
        <View style={styles.skeletonLeft} />
        <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Shimmer width="55%" height={16} radius={6} />
                <Shimmer width="20%" height={14} radius={6} />
            </View>
            <Shimmer width="35%" height={12} radius={6} />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <Shimmer width={52} height={26} radius={8} />
                <Shimmer width={52} height={26} radius={8} />
                <Shimmer width={52} height={26} radius={8} />
            </View>
        </View>
    </View>
);

const SkeletonStatCard: React.FC = () => (
    <View style={styles.statCardSkeleton}>
        <Shimmer width={60} height={10} radius={5} />
        <Shimmer width={40} height={28} radius={8} />
        <Shimmer width={50} height={10} radius={5} />
    </View>
);

// ─── Swipeable Meal Card ─────────────────────────────────────────────────────

interface SwipeCardProps {
    item: MealEntry;
    index: number;
    onDelete: (id: number) => void;
    onEdit: (item: MealEntry) => void;
}

const SwipeableMealCard: React.FC<SwipeCardProps> = ({
    item,
    index,
    onDelete,
    onEdit,
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const deleteOpacity = useRef(new Animated.Value(0)).current;
    const editOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(1)).current;

    // Staggered entrance
    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            delay: index * 60,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
        }).start();
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) =>
                Math.abs(g.dx) > 8 && Math.abs(g.dy) < 25,
            onPanResponderMove: (_, g) => {
                translateX.setValue(g.dx);
                const ratio = Math.min(Math.abs(g.dx) / SWIPE_THRESHOLD, 1);
                if (g.dx < 0) {
                    deleteOpacity.setValue(ratio);
                    editOpacity.setValue(0);
                } else {
                    editOpacity.setValue(ratio);
                    deleteOpacity.setValue(0);
                }
            },
            onPanResponderRelease: (_, g) => {
                if (g.dx < -SWIPE_THRESHOLD) {
                    // Delete action
                    Animated.timing(translateX, {
                        toValue: -SW,
                        duration: 280,
                        useNativeDriver: true,
                    }).start(() => onDelete(item.id));
                } else if (g.dx > SWIPE_THRESHOLD) {
                    // Edit action
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 100,
                        friction: 10,
                        useNativeDriver: true,
                    }).start(() => onEdit(item));
                    deleteOpacity.setValue(0);
                    editOpacity.setValue(0);
                } else {
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 120,
                        friction: 12,
                        useNativeDriver: true,
                    }).start();
                    Animated.timing(deleteOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                    Animated.timing(editOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const mealColor =
        T.mealColors[
        item.meal_type.charAt(0)
            .toUpperCase()
        +
        item.meal_type.slice(1)
        ] || T.primary;
    const mealEmoji =
        T.mealEmoji[
        item.meal_type.charAt(0)
            .toUpperCase()
        +
        item.meal_type.slice(1)
        ] || "🍽️";

    const handlePress = () => {
        Animated.sequence([
            Animated.spring(cardScale, {
                toValue: 0.97,
                tension: 200,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
                toValue: 1,
                tension: 200,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <Animated.View
            style={[
                styles.swipeContainer,
                {
                    opacity: scaleAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            {/* Delete BG */}
            <Animated.View
                style={[styles.swipeBgDelete, { opacity: deleteOpacity }]}
            >
                <View style={styles.swipeAction}>
                    <Text style={styles.swipeActionIcon}>🗑</Text>
                    <Text style={styles.swipeActionLabel}>Delete</Text>
                </View>
            </Animated.View>

            {/* Edit BG */}
            <Animated.View style={[styles.swipeBgEdit, { opacity: editOpacity }]}>
                <View style={[styles.swipeAction, { alignItems: "flex-start", paddingLeft: 20 }]}>
                    <Text style={styles.swipeActionIcon}>✏️</Text>
                    <Text style={[styles.swipeActionLabel, { color: T.edit }]}>Edit</Text>
                </View>
            </Animated.View>

            {/* Card */}
            <Animated.View
                style={{ transform: [{ translateX }, { scale: cardScale }] }}
                {...panResponder.panHandlers}
            >
                <Pressable onPress={handlePress} style={styles.mealCard}>
                    {/* Accent Line */}
                    <View style={[styles.cardAccent, { backgroundColor: mealColor }]} />

                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTitleRow}>
                                <Text style={styles.mealEmoji}>{mealEmoji}</Text>
                                <Text style={styles.foodName} numberOfLines={1}>
                                    {item.food_name}
                                </Text>
                            </View>
                            <View style={styles.caloriesBadge}>
                                <Text style={styles.caloriesText}>{item.calories}</Text>
                                <Text style={styles.caloriesUnit}>kcal</Text>
                            </View>
                        </View>

                        <View style={styles.metaRow}>
                            <View
                                style={[
                                    styles.mealTypeBadge,
                                    { borderColor: mealColor + "40" },
                                ]}
                            >
                                <Text style={[styles.mealTypeText, { color: mealColor }]}>
                                    {item.meal_type}
                                </Text>
                            </View>
                            <Text style={styles.dot}>·</Text>
                            <Text style={styles.timeText}>{formatTime(item.consumed_at)}</Text>
                            <Text style={styles.dot}>·</Text>
                            <Text style={styles.gramsText}>{item.grams}g</Text>
                        </View>

                        <View style={styles.macrosRow}>
                            <MacroPill label="P" value={item.protein} unit="g" color={T.success} />
                            <MacroPill label="C" value={item.carbs} unit="g" color={T.secondary} />
                            <MacroPill label="F" value={item.fat} unit="g" color="#F59E0B" />
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};

// ─── Macro Pill ──────────────────────────────────────────────────────────────

const MacroPill: React.FC<{
    label: string;
    value: number;
    unit: string;
    color: string;
}> = ({ label, value, unit, color }) => (
    <View style={[styles.macroPill, { borderColor: color + "30" }]}>
        <Text style={[styles.macroLabel, { color }]}>{label}</Text>
        <Text style={styles.macroValue}>
            {value}
            <Text style={styles.macroUnit}>{unit}</Text>
        </Text>
    </View>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon: string;
    color: string;
    delay: number;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    unit,
    icon,
    color,
    delay,
}) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(anim, {
            toValue: 1,
            delay,
            tension: 70,
            friction: 10,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.statCard,
                {
                    opacity: anim,
                    transform: [
                        {
                            translateY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <LinearGradient
                colors={[color + "18", color + "06"]}
                style={styles.statCardGradient}
            >
                <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
                    <Text style={styles.statIconText}>{icon}</Text>
                </View>
                <Text style={[styles.statValue, { color }]}>
                    {value}
                    {unit && <Text style={styles.statUnit}>{unit}</Text>}
                </Text>
                <Text style={styles.statLabel}>{label}</Text>
            </LinearGradient>
        </Animated.View>
    );
};

// ─── Filter Pill ─────────────────────────────────────────────────────────────

const FILTERS = ["All", "Breakfast", "Lunch", "Dinner", "Snack"] as const;
type FilterType = (typeof FILTERS)[number];

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(anim, {
            toValue: 1,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -8,
                    duration: 1800,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.emptyContainer,
                {
                    opacity: anim,
                    transform: [
                        {
                            scale: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.85, 1],
                            }),
                        },
                    ],
                },
            ]}
        >
            <Animated.Text
                style={[
                    styles.emptyEmoji,
                    { transform: [{ translateY: floatAnim }] },
                ]}
            >
                🍽️
            </Animated.Text>
            <Text style={styles.emptyTitle}>No Meals Logged Yet</Text>
            <Text style={styles.emptySubtitle}>
                Start tracking your nutrition journey
            </Text>
            <TouchableOpacity onPress={onAdd} activeOpacity={0.8}>
                <LinearGradient
                    colors={[T.primary, T.highlight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addFirstMealBtn}
                >
                    <Text style={styles.addFirstMealText}>+ Add First Meal</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLineRight} />
    </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface Props {
    navigation?: any;
}

const MealHistoryScreen: React.FC<Props> = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [meals, setMeals] = useState<MealEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("All");
    const filterAnimRef = useRef<Record<string, Animated.Value>>({});
    const headerAnim = useRef(new Animated.Value(0)).current;
    const searchAnim = useRef(new Animated.Value(0)).current;
    const filterScrollRef = useRef<ScrollView>(null);
    const loadMeals = async () => {

        try {

            setIsLoading(true);

            const response =
                await getTodayMeals();

            console.log(
                "MEAL HISTORY:",
                response
            );

            const mealsData =
                response?.data?.meals ?? [];

            setMeals(mealsData);

        } catch (error) {

            console.log(
                "MEAL HISTORY ERROR:",
                error
            );

        } finally {

            setIsLoading(false);

        }

    };

    // Initialize filter anims
    FILTERS.forEach((f) => {
        if (!filterAnimRef.current[f]) {
            filterAnimRef.current[f] = new Animated.Value(f === "All" ? 1 : 0);
        }
    });

    useEffect(() => {

        loadMeals();

    }, []);


    const handleFilterPress = (filter: FilterType) => {
        setActiveFilter(filter);
        Object.entries(filterAnimRef.current).forEach(([key, anim]) => {
            Animated.spring(anim, {
                toValue: key === filter ? 1 : 0,
                tension: 120,
                friction: 10,
                useNativeDriver: false,
            }).start();
        });
    };

    const handleDelete =
        useCallback(async (id: number) => {

            try {

                await deleteMeal(id);

                setMeals(
                    prev =>
                        prev.filter(
                            m => m.id !== id
                        )
                );

            } catch (error) {

                console.log(
                    "DELETE ERROR:",
                    error
                );

            }

        }, []);

    const handleEdit = useCallback((item: MealEntry) => {
        // navigate to edit screen
    }, []);

    const filteredMeals = useMemo(() => {
        return meals.filter((m) => {
            const matchesSearch =
                m.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.meal_type.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter =
                activeFilter === "All" || m.meal_type === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [meals, searchQuery, activeFilter]);

    // Group by date
    const sections = useMemo(() => {
        const grouped: Record<string, MealEntry[]> = {};
        filteredMeals.forEach((m) => {
            const key = getDateKey(m.consumed_at);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m);
        });
        return Object.entries(grouped).map(([key, data]) => ({
            title: getDateLabel(data[0].consumed_at),
            data,
        }));
    }, [filteredMeals]);

    // Today's totals
    const todayMeals = useMemo(
        () =>
            meals.filter(
                (m) => getDateKey(m.consumed_at) === getDateKey(new Date().toISOString())
            ),
        [meals]
    );
    const totalCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
    const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0);

    // ─── Render ───

    const renderSectionHeader = ({ section: { title } }: any) => (
        <SectionHeader title={title} />
    );

    const renderItem = ({ item, index }: { item: MealEntry; index: number }) => (
        <SwipeableMealCard
            item={item}
            index={index}
            onDelete={handleDelete}
            onEdit={handleEdit}
        />
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={T.bg} />

            {/* Background */}
            <View style={styles.bgGlow1} pointerEvents="none" />
            <View style={styles.bgGlow2} pointerEvents="none" />

            {/* ─── Header ─── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack()}
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <View style={styles.headerBrand}>
                        <Text style={styles.brandStar}>✨</Text>
                        <Text style={styles.brandText}>Netrilens AI</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Meal History</Text>
                    <Text style={styles.headerSubtitle}>Review your nutrition journey</Text>
                </View>

                <View style={styles.headerDivider} />
            </Animated.View>

            <SectionList
                sections={isLoading ? [] : sections}
                keyExtractor={(item) => String(item.id)}
                renderSectionHeader={renderSectionHeader}
                renderItem={renderItem}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={[
                    styles.listContent,
                    filteredMeals.length === 0 && !isLoading && { flex: 1 },
                ]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {/* ─── Stat Cards ─── */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.statScroll}
                            style={styles.statScrollWrapper}
                        >
                            {isLoading ? (
                                <>
                                    <SkeletonStatCard />
                                    <SkeletonStatCard />
                                    <SkeletonStatCard />
                                </>
                            ) : (
                                <>
                                    <StatCard
                                        label="Meals Today"
                                        value={todayMeals.length}
                                        icon="🍽️"
                                        color={T.primary}
                                        delay={200}
                                    />
                                    <StatCard
                                        label="Calories"
                                        value={totalCalories.toLocaleString()}
                                        icon="⚡"
                                        color={T.secondary}
                                        delay={300}
                                    />
                                    <StatCard
                                        label="Protein"
                                        value={totalProtein}
                                        unit="g"
                                        icon="💪"
                                        color={T.success}
                                        delay={400}
                                    />
                                </>
                            )}
                        </ScrollView>

                        {/* ─── Search ─── */}
                        <Animated.View
                            style={[
                                styles.searchContainer,
                                {
                                    opacity: searchAnim,
                                    transform: [
                                        {
                                            translateY: searchAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [10, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.searchBar}>
                                <Text style={styles.searchIcon}>🔍</Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search meals..."
                                    placeholderTextColor={T.textDim}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    returnKeyType="search"
                                    autoCorrect={false}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setSearchQuery("")}
                                        style={styles.clearBtn}
                                    >
                                        <View style={styles.clearBtnInner}>
                                            <Text style={styles.clearIcon}>✕</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>

                        {/* ─── Filter Pills ─── */}
                        <ScrollView
                            ref={filterScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterScroll}
                            style={styles.filterScrollWrapper}
                        >
                            {FILTERS.map((filter) => {
                                const isActive = activeFilter === filter;
                                const anim = filterAnimRef.current[filter];
                                const bgColor = anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["rgba(255,255,255,0.04)", T.primary + "22"],
                                });
                                const borderColor = anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [T.border, T.primary + "80"],
                                });
                                const textColor = anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [T.textSecondary, T.textPrimary],
                                });

                                return (
                                    <TouchableOpacity
                                        key={filter}
                                        onPress={() => handleFilterPress(filter)}
                                        activeOpacity={0.75}
                                    >
                                        <Animated.View
                                            style={[
                                                styles.filterPill,
                                                {
                                                    backgroundColor: bgColor,
                                                    borderColor: borderColor,
                                                },
                                            ]}
                                        >
                                            {isActive && (
                                                <View style={styles.filterGlow} />
                                            )}
                                            <Animated.Text
                                                style={[styles.filterPillText, { color: textColor }]}
                                            >
                                                {filter}
                                            </Animated.Text>
                                        </Animated.View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Skeleton section */}
                        {isLoading && (
                            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                                <SectionHeader title="Today" />
                                {[1, 2, 3].map((i) => (
                                    <SkeletonCard key={i} />
                                ))}
                                <SectionHeader title="Yesterday" />
                                {[1, 2].map((i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <EmptyState onAdd={() => navigation?.navigate("LogMeal")} />
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: T.bg,
    },

    // Background glows
    bgGlow1: {
        position: "absolute",
        top: -60,
        right: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: T.primary,
        opacity: 0.06,
    },
    bgGlow2: {
        position: "absolute",
        bottom: 100,
        left: -100,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: T.secondary,
        opacity: 0.05,
    },

    // Header
    header: {
        paddingTop: 8,
        paddingBottom: 0,
        borderBottomWidth: 0,
    },
    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: T.elevated,
        borderWidth: 1,
        borderColor: T.border,
        alignItems: "center",
        justifyContent: "center",
    },
    backIcon: {
        color: T.textPrimary,
        fontSize: 24,
        fontWeight: "300",
        marginTop: -2,
    },
    headerBrand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    brandStar: {
        fontSize: 14,
    },
    brandText: {
        color: T.textSecondary,
        fontSize: 13,
        fontWeight: "500",
        letterSpacing: 0.5,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 16,
    },
    headerTitle: {
        color: T.textPrimary,
        fontSize: 32,
        fontWeight: "700",
        letterSpacing: -0.8,
        lineHeight: 38,
    },
    headerSubtitle: {
        color: T.textSecondary,
        fontSize: 14,
        marginTop: 4,
        fontWeight: "400",
        letterSpacing: 0.1,
    },
    headerDivider: {
        height: 1,
        backgroundColor: T.border,
        marginHorizontal: 20,
        marginBottom: 4,
    },

    // Stat Cards
    statScrollWrapper: {
        marginTop: 16,
    },
    statScroll: {
        paddingHorizontal: 20,
        gap: 12,
        paddingRight: 24,
    },
    statCard: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: T.border,
        width: 116,
    },
    statCardGradient: {
        padding: 16,
        alignItems: "flex-start",
        gap: 8,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    statIconText: {
        fontSize: 16,
    },
    statValue: {
        fontSize: 26,
        fontWeight: "700",
        letterSpacing: -0.5,
        lineHeight: 30,
    },
    statUnit: {
        fontSize: 14,
        fontWeight: "500",
    },
    statLabel: {
        color: T.textSecondary,
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.3,
    },
    statCardSkeleton: {
        width: 116,
        height: 112,
        borderRadius: 16,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: T.border,
        padding: 16,
        gap: 8,
        justifyContent: "center",
    },

    // Search
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: T.elevated,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: T.border,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 13 : 10,
        gap: 10,
    },
    searchIcon: {
        fontSize: 15,
    },
    searchInput: {
        flex: 1,
        color: T.textPrimary,
        fontSize: 15,
        fontWeight: "400",
        padding: 0,
        margin: 0,
    },
    clearBtn: {
        padding: 2,
    },
    clearBtnInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: T.textDim,
        alignItems: "center",
        justifyContent: "center",
    },
    clearIcon: {
        color: T.textPrimary,
        fontSize: 10,
        fontWeight: "700",
    },

    // Filter Pills
    filterScrollWrapper: {
        marginTop: 14,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
        paddingRight: 24,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 40,
        borderWidth: 1,
        overflow: "hidden",
        position: "relative",
        minWidth: 60,
        alignItems: "center",
    },
    filterGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: T.primary,
        opacity: 0.08,
        borderRadius: 40,
    },
    filterPillText: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.2,
    },

    // Section Header
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 14,
        marginHorizontal: 20,
        gap: 10,
    },
    sectionLine: {
        height: 1,
        width: 12,
        backgroundColor: T.border,
    },
    sectionLineRight: {
        flex: 1,
        height: 1,
        backgroundColor: T.border,
    },
    sectionTitle: {
        color: T.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
        textTransform: "uppercase",
    },

    // Swipeable
    swipeContainer: {
        marginHorizontal: 20,
        marginBottom: 10,
        position: "relative",
    },
    swipeBgDelete: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: T.danger + "20",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.danger + "40",
        justifyContent: "center",
        alignItems: "flex-end",
    },
    swipeBgEdit: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: T.edit + "20",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.edit + "40",
        justifyContent: "center",
        alignItems: "flex-start",
    },
    swipeAction: {
        paddingHorizontal: 20,
        alignItems: "flex-end",
        gap: 4,
    },
    swipeActionIcon: {
        fontSize: 20,
    },
    swipeActionLabel: {
        color: T.danger,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    // Meal Card
    mealCard: {
        backgroundColor: T.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.border,
        flexDirection: "row",
        overflow: "hidden",
    },
    cardAccent: {
        width: 3,
        borderRadius: 3,
        margin: 10,
        alignSelf: "stretch",
    },
    cardContent: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 14,
        gap: 8,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
        marginRight: 8,
    },
    mealEmoji: {
        fontSize: 18,
    },
    foodName: {
        color: T.textPrimary,
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        letterSpacing: -0.2,
    },
    caloriesBadge: {
        alignItems: "flex-end",
    },
    caloriesText: {
        color: T.textPrimary,
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: -0.5,
        lineHeight: 21,
    },
    caloriesUnit: {
        color: T.textDim,
        fontSize: 10,
        fontWeight: "500",
        textAlign: "right",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    mealTypeBadge: {
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    mealTypeText: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.2,
    },
    dot: {
        color: T.textDim,
        fontSize: 12,
    },
    timeText: {
        color: T.textSecondary,
        fontSize: 12,
        fontWeight: "400",
    },
    gramsText: {
        color: T.textDim,
        fontSize: 12,
        fontWeight: "400",
    },
    macrosRow: {
        flexDirection: "row",
        gap: 6,
    },
    macroPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    macroLabel: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    macroValue: {
        color: T.textPrimary,
        fontSize: 12,
        fontWeight: "600",
    },
    macroUnit: {
        color: T.textSecondary,
        fontSize: 10,
        fontWeight: "400",
    },

    // Skeleton Card
    skeletonCard: {
        backgroundColor: T.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.border,
        flexDirection: "row",
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 10,
        gap: 12,
    },
    skeletonLeft: {
        width: 3,
        borderRadius: 3,
        backgroundColor: T.elevated,
        alignSelf: "stretch",
    },

    // List
    listContent: {
        paddingBottom: 40,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingVertical: 60,
        gap: 12,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 8,
    },
    emptyTitle: {
        color: T.textPrimary,
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: -0.4,
    },
    emptySubtitle: {
        color: T.textSecondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 8,
    },
    addFirstMealBtn: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 40,
        marginTop: 4,
    },
    addFirstMealText: {
        color: T.textPrimary,
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});

export default MealHistoryScreen;

function loadMeals() {
    throw new Error("Function not implemented.");
}
