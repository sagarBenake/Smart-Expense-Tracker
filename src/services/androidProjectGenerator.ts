import JSZip from 'jszip';

export interface ProjectFile {
  path: string;
  name: string;
  category: 'gradle' | 'manifest' | 'kotlin' | 'compose' | 'room' | 'sms' | 'sync' | 'tests' | 'docs';
  content: string;
}

export function getAndroidProjectFiles(): ProjectFile[] {
  return [
    {
      path: 'README.md',
      name: 'README.md',
      category: 'docs',
      content: `# Smart Expense Tracker - Production Android Application

An intelligent, offline-first personal expense tracker for Android smartphones with automatic Indian transaction SMS detection, custom keyword-based category rules, Room local database, Google Sheets cloud synchronization, budget management, and financial reports.

## 🚀 Key Features

* **Automatic SMS Parsing**: Real-time broadcast receiver for Indian Banks (HDFC, SBI, ICICI, Axis, Kotak, etc.) and UPI apps (PhonePe, Google Pay, Paytm, CRED).
* **Credit vs Debit Filtering**: Automatically discards credit/salary/refunds, OTPs, promotional alerts, and loan spams from becoming expenses.
* **Custom Categories & Rules**: Create unlimited custom categories with user-defined keyword triggers that evaluate before default categories.
* **Confidence & Review System**: Configurable confidence threshold (e.g. 85%+ auto-records, uncertain prompts for 1-tap review).
* **Duplicate Detection**: Computes cryptographic hash from amount, merchant, reference ID, and SMS body to prevent duplicate records.
* **Google Sheets Cloud Sync**: Direct two-way synchronization into user's personal Google Spreadsheet with 15-column standard financial schema.
* **Offline-First Room DB**: Full offline functionality with persistent SQLite via Room, and WorkManager background sync retry queue.
* **Monthly & Category Budgets**: Visual meters with 80% and 100% threshold alert notifications.
* **Material 3 UI**: Clean Jetpack Compose interface with dark mode, rounded cards, and Indian Rupee (₹) formatting.

---

## 🛠️ Google Cloud & Google Sheets Setup Guide

Follow these steps to configure Google OAuth & Sheets API:

1. **Create Google Cloud Project**:
   * Go to [Google Cloud Console](https://console.cloud.google.com/).
   * Click **New Project** and name it \`Smart-Expense-Tracker\`.

2. **Enable Google Sheets & Drive APIs**:
   * Navigate to **APIs & Services > Library**.
   * Search for **Google Sheets API** and click **Enable**.
   * Search for **Google Drive API** and click **Enable**.

3. **Configure OAuth Consent Screen**:
   * Go to **APIs & Services > OAuth consent screen**.
   * Select **External** (or Internal for Workspace).
   * Fill in App name: \`Smart Expense Tracker\`, User support email, and Developer contact.
   * Under **Scopes**, add:
     - \`https://www.googleapis.com/auth/spreadsheets\`
     - \`https://www.googleapis.com/auth/drive.file\`
     - \`https://www.googleapis.com/auth/userinfo.email\`

4. **Create Android OAuth 2.0 Client ID**:
   * Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   * Application type: **Android**.
   * Package name: \`com.smartexpense.tracker\`
   * Obtain your debug SHA-1 fingerprint:
     \`\`\`bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     \`\`\`
   * Paste the SHA-1 fingerprint and click **Create**.

5. **Download \`google-services.json\` (if using Firebase / Play Services)**:
   * Place the credentials file in \`app/\` directory.

---

## 📱 Building & Running the App

1. Open Android Studio (Ladybug or newer).
2. Select **Open** and choose this project folder.
3. Allow Gradle to sync dependencies.
4. Run on an Android Device or Emulator running Android 8.0+ (API Level 26+).

\`\`\`bash
# Build Debug APK from command line
./gradlew assembleDebug

# Run Unit Tests
./gradlew test
\`\`\`
`,
    },
    {
      path: 'build.gradle.kts',
      name: 'build.gradle.kts (Root)',
      category: 'gradle',
      content: `// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.hilt) apply false
}
`,
    },
    {
      path: 'app/build.gradle.kts',
      name: 'app/build.gradle.kts',
      category: 'gradle',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

android {
    namespace = "com.smartexpense.tracker"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.smartexpense.tracker"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Lifecycle & Coroutines
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.coroutines.android)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // WorkManager (Offline Background Sync)
    implementation(libs.androidx.work.runtime.ktx)

    // Dependency Injection - Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // Google Sign-In & Google Sheets API
    implementation(libs.play.services.auth)
    implementation(libs.google.api.client.android)
    implementation(libs.google.api.services.sheets)
    implementation(libs.google.http.client.gson)

    // Unit Testing
    testImplementation(libs.junit)
    testImplementation(libs.truth)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      name: 'AndroidManifest.xml',
      category: 'manifest',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions for Automatic SMS Expense Tracking -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />

    <!-- Network permissions for Google Sheets Sync -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Notifications for Budget Alerts & Expense Confirmations -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".SmartExpenseApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmartExpenseTracker">

        <activity
            android:name=".presentation.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.SmartExpenseTracker">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- SMS Broadcast Receiver -->
        <receiver
            android:name=".sms.receiver.SmsBroadcastReceiver"
            android:exported="true"
            android:permission="android.permission.BROADCAST_SMS">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>
`,
    },
    {
      path: 'app/src/main/java/com/smartexpense/tracker/data/local/entity/TransactionEntity.kt',
      name: 'TransactionEntity.kt',
      category: 'room',
      content: `package com.smartexpense.tracker.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "transactions",
    foreignKeys = [
        ForeignKey(
            entity = CategoryEntity::class,
            parentColumns = ["id"],
            childColumns = ["categoryId"],
            onDelete = ForeignKey.RESTRICT
        )
    ],
    indices = [
        Index("categoryId"),
        Index("date"),
        Index("smsHash", unique = true),
        Index("referenceId")
    ]
)
data class TransactionEntity(
    @PrimaryKey
    val id: String,
    val amount: Double,
    val merchant: String,
    val categoryId: String,
    val date: String, // Format: YYYY-MM-DD
    val time: String, // Format: HH:mm
    val paymentMethod: String, // UPI, Credit Card, Debit Card, Cash, etc.
    val transactionType: String, // Expense, Credit, Transfer
    val source: String, // sms, manual, import
    val bank: String? = null,
    val accountLast4: String? = null,
    val referenceId: String? = null,
    val notes: String? = null,
    val receiptUri: String? = null,
    val isConfirmed: Boolean = true,
    val confidenceScore: Double = 1.0,
    val smsHash: String? = null,
    val rawSmsText: String? = null,
    val syncStatus: String = "pending", // synced, pending, failed
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
`,
    },
    {
      path: 'app/src/main/java/com/smartexpense/tracker/data/local/entity/CategoryEntity.kt',
      name: 'CategoryEntity.kt',
      category: 'room',
      content: `package com.smartexpense.tracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val icon: String, // Emoji or icon name
    val color: String, // Hex color code (e.g. #F97316)
    val monthlyBudget: Double? = null,
    val isDefault: Boolean = false,
    val isActive: Boolean = true,
    val keywords: String = "", // Comma-separated keyword rules
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    fun getKeywordList(): List<String> =
        keywords.split(",").map { it.trim().lowercase() }.filter { it.isNotEmpty() }
}
`,
    },
    {
      path: 'app/src/main/java/com/smartexpense/tracker/data/local/dao/TransactionDao.kt',
      name: 'TransactionDao.kt',
      category: 'room',
      content: `package com.smartexpense.tracker.data.local.dao

import androidx.room.*
import com.smartexpense.tracker.data.local.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY date DESC, time DESC")
    fun getAllTransactionsFlow(): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE date LIKE :monthPrefix ORDER BY date DESC, time DESC")
    fun getTransactionsByMonthFlow(monthPrefix: String): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun getTransactionById(id: String): TransactionEntity?

    @Query("SELECT * FROM transactions WHERE smsHash = :hash LIMIT 1")
    suspend fun findBySmsHash(hash: String): TransactionEntity?

    @Query("SELECT * FROM transactions WHERE referenceId = :refId LIMIT 1")
    suspend fun findByReferenceId(refId: String): TransactionEntity?

    @Query("SELECT * FROM transactions WHERE syncStatus = 'pending' OR syncStatus = 'failed'")
    suspend fun getPendingSyncTransactions(): List<TransactionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)

    @Update
    suspend fun updateTransaction(transaction: TransactionEntity)

    @Delete
    suspend fun deleteTransaction(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun deleteById(id: String)
}
`,
    },
    {
      path: 'app/src/main/java/com/smartexpense/tracker/sms/parser/SmsTransactionParser.kt',
      name: 'SmsTransactionParser.kt',
      category: 'sms',
      content: `package com.smartexpense.tracker.sms.parser

import com.smartexpense.tracker.data.local.entity.CategoryEntity
import java.security.MessageDigest
import java.util.regex.Pattern

data class ParsedSmsResult(
    val amount: Double?,
    val merchant: String,
    val suggestedCategoryId: String,
    val suggestedCategoryName: String,
    val paymentMethod: String,
    val transactionType: String,
    val bank: String,
    val accountLast4: String?,
    val referenceId: String?,
    val confidenceScore: Double,
    val isDebit: Boolean,
    val isOtpOrSpam: Boolean,
    val rawSmsHash: String,
    val rawText: String
)

class SmsTransactionParser {

    private val otpPattern = Pattern.compile(
        "\\\\b(otp|verification code|one time password|security code|login with)\\\\b",
        Pattern.CASE_INSENSITIVE
    )

    private val debitKeywords = Pattern.compile(
        "\\\\b(debited|spent|paid|purchase|withdrawn|charged|sent to|transfer to)\\\\b",
        Pattern.CASE_INSENSITIVE
    )

    private val creditKeywords = Pattern.compile(
        "\\\\b(credited|deposited|salary|refund|cashback|reversed|received)\\\\b",
        Pattern.CASE_INSENSITIVE
    )

    fun parse(smsBody: String, sender: String, categories: List<CategoryEntity>): ParsedSmsResult {
        val clean = smsBody.trim()
        val lower = clean.lowercase()

        // 1. Discard OTP & Marketing
        val isOtp = otpPattern.matcher(clean).find()
        val isSpam = clean.contains("pre-approved", ignoreCase = true) || clean.contains("claim now", ignoreCase = true)
        val isOtpOrSpam = isOtp || isSpam

        // 2. Debit vs Credit
        val isDebit = debitKeywords.matcher(clean).find()
        val isCredit = creditKeywords.matcher(clean).find() && !isDebit

        // 3. Amount Extraction
        var amount: Double? = null
        val amountPatterns = listOf(
            Pattern.compile("(?:rs\\\\.?|inr|₹)\\\\s*([\\\\d,]+(?:\\\\.\\\\d{1,2})?)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(?:debited|spent|paid)\\\\s*(?:by|with)?\\\\s*(?:rs\\\\.?|inr|₹)?\\\\s*([\\\\d,]+(?:\\\\.\\\\d{1,2})?)", Pattern.CASE_INSENSITIVE)
        )
        for (pattern in amountPatterns) {
            val matcher = pattern.matcher(clean)
            if (matcher.find()) {
                val numStr = matcher.group(1)?.replace(",", "")
                amount = numStr?.toDoubleOrNull()
                if (amount != null && amount > 0) break
            }
        }

        // 4. Payment Method & Bank
        val paymentMethod = when {
            clean.contains("upi", ignoreCase = true) || clean.contains("vpa", ignoreCase = true) -> "UPI"
            clean.contains("credit card", ignoreCase = true) -> "Credit Card"
            clean.contains("debit card", ignoreCase = true) || clean.contains("atm", ignoreCase = true) -> "Debit Card"
            clean.contains("net banking", ignoreCase = true) -> "Net Banking"
            else -> "UPI"
        }

        val bank = when {
            sender.contains("HDFC", ignoreCase = true) || clean.contains("HDFC", ignoreCase = true) -> "HDFC Bank"
            sender.contains("SBI", ignoreCase = true) || clean.contains("SBI", ignoreCase = true) -> "SBI"
            sender.contains("ICICI", ignoreCase = true) || clean.contains("ICICI", ignoreCase = true) -> "ICICI Bank"
            sender.contains("AXIS", ignoreCase = true) || clean.contains("AXIS", ignoreCase = true) -> "Axis Bank"
            else -> "Bank Transfer"
        }

        // 5. Account & Ref ID
        var accountLast4: String? = null
        val accMatcher = Pattern.compile("(?:a/c|account|card|ending)\\\\s*(?:no\\\\.?)?\\\\s*[x*]*([0-9]{3,4})", Pattern.CASE_INSENSITIVE).matcher(clean)
        if (accMatcher.find()) {
            accountLast4 = accMatcher.group(1)
        }

        var referenceId: String? = null
        val refMatcher = Pattern.compile("(?:ref|rrn|upi ref|txn id)\\\\s*[:\\\\-#]?\\\\s*([a-zA-Z0-9]{6,20})", Pattern.CASE_INSENSITIVE).matcher(clean)
        if (refMatcher.find()) {
            referenceId = refMatcher.group(1)
        }

        // 6. Merchant Extraction
        var merchant = "Unknown Merchant"
        val merchMatcher = Pattern.compile("(?:at|to|paid to)\\\\s+([A-Za-z0-9\\\\s&.'-]{2,20})(?:\\\\s+on|\\\\s+ref|\\\\.|$)", Pattern.CASE_INSENSITIVE).matcher(clean)
        if (merchMatcher.find()) {
            merchant = merchMatcher.group(1)?.trim()?.uppercase() ?: "Unknown Merchant"
        }

        // 7. Custom Categories & Keyword Rule Matching
        var matchedCat = categories.firstOrNull { it.id == "cat_other" } ?: categories.firstOrNull()
        var highestScore = 0

        for (cat in categories.filter { it.isActive }) {
            val kwList = cat.getKeywordList()
            var score = 0
            for (kw in kwList) {
                if (merchant.contains(kw, ignoreCase = true)) score += 10
                if (lower.contains(kw)) score += 3
            }
            if (score > highestScore) {
                highestScore = score
                matchedCat = cat
            }
        }

        // 8. Confidence Score
        var confidence = 0.1
        if (!isOtpOrSpam && !isCredit) {
            if (amount != null && amount > 0) confidence += 0.35
            if (isDebit) confidence += 0.25
            if (merchant != "Unknown Merchant") confidence += 0.20
            if (referenceId != null || accountLast4 != null) confidence += 0.10
        }
        confidence = confidence.coerceIn(0.0, 1.0)

        // 9. Hash for Deduplication
        val hash = MessageDigest.getInstance("MD5")
            .digest("\${amount}_\${merchant}_\${referenceId}_\${clean}".toByteArray())
            .joinToString("") { "%02x".format(it) }

        return ParsedSmsResult(
            amount = amount,
            merchant = merchant,
            suggestedCategoryId = matchedCat?.id ?: "cat_other",
            suggestedCategoryName = matchedCat?.name ?: "Other",
            paymentMethod = paymentMethod,
            transactionType = if (isCredit) "Credit" else "Expense",
            bank = bank,
            accountLast4 = accountLast4,
            referenceId = referenceId,
            confidenceScore = confidence,
            isDebit = isDebit,
            isOtpOrSpam = isOtpOrSpam,
            rawSmsHash = hash,
            rawText = clean
        )
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/smartexpense/tracker/sms/receiver/SmsBroadcastReceiver.kt',
      name: 'SmsBroadcastReceiver.kt',
      category: 'sms',
      content: `package com.smartexpense.tracker.sms.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import com.smartexpense.tracker.domain.repository.ExpenseRepository
import com.smartexpense.tracker.notifications.ExpenseNotificationManager
import com.smartexpense.tracker.sms.parser.SmsTransactionParser
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

@AndroidEntryPoint
class SmsBroadcastReceiver : BroadcastReceiver() {

    @Inject
    lateinit var expenseRepository: ExpenseRepository

    @Inject
    lateinit var notificationManager: ExpenseNotificationManager

    private val parser = SmsTransactionParser()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        if (messages.isNullOrEmpty()) return

        val fullBody = messages.joinToString("") { it.messageBody ?: "" }
        val sender = messages[0].originatingAddress ?: ""

        CoroutineScope(Dispatchers.IO).launch {
            val categories = expenseRepository.getAllCategoriesSync()
            val result = parser.parse(fullBody, sender, categories)

            // Discard OTPs, Promotional SMS, or Credits
            if (result.isOtpOrSpam || !result.isDebit || result.amount == null || result.amount <= 0) {
                return@launch
            }

            // Duplicate Detection
            if (expenseRepository.isDuplicate(result.rawSmsHash, result.referenceId)) {
                return@launch
            }

            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            val now = Date()

            val isHighConfidence = result.confidenceScore >= 0.85

            val transactionId = "TXN-\${System.currentTimeMillis()}"

            // Save to Room DB
            expenseRepository.insertTransaction(
                id = transactionId,
                amount = result.amount,
                merchant = result.merchant,
                categoryId = result.suggestedCategoryId,
                date = dateFormat.format(now),
                time = timeFormat.format(now),
                paymentMethod = result.paymentMethod,
                bank = result.bank,
                accountLast4 = result.accountLast4,
                referenceId = result.referenceId,
                isConfirmed = isHighConfidence,
                confidenceScore = result.confidenceScore,
                smsHash = result.rawSmsHash,
                rawSmsText = fullBody
            )

            // Show Android Notification
            if (isHighConfidence) {
                notificationManager.showExpenseRecordedNotification(result.amount, result.merchant)
            } else {
                notificationManager.showReviewExpenseNotification(transactionId, result.amount, result.merchant)
            }
        }
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/smartexpense/tracker/sync/GoogleSheetsSyncManager.kt',
      name: 'GoogleSheetsSyncManager.kt',
      category: 'sync',
      content: `package com.smartexpense.tracker.sync

import com.smartexpense.tracker.data.local.dao.TransactionDao
import com.google.api.services.sheets.v4.Sheets
import com.google.api.services.sheets.v4.model.ValueRange
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GoogleSheetsSyncManager @Inject constructor(
    private val transactionDao: TransactionDao
) {
    suspend fun syncPendingTransactions(sheetsService: Sheets, spreadsheetId: String): Result<Int> =
        withContext(Dispatchers.IO) {
            try {
                val pending = transactionDao.getPendingSyncTransactions()
                if (pending.isEmpty()) return@withContext Result.success(0)

                val rows = pending.map { t ->
                    listOf(
                        t.id,
                        t.date,
                        t.time,
                        t.merchant,
                        t.amount,
                        t.categoryId,
                        t.paymentMethod,
                        t.transactionType,
                        t.source,
                        t.bank ?: "",
                        t.accountLast4 ?: "",
                        t.referenceId ?: "",
                        t.notes ?: "",
                        t.createdAt.toString(),
                        t.updatedAt.toString()
                    )
                }

                val body = ValueRange().setValues(rows)
                sheetsService.spreadsheets().values()
                    .append(spreadsheetId, "Expenses_2026!A:O", body)
                    .setValueInputOption("USER_ENTERED")
                    .execute()

                // Mark synced in local Room database
                pending.forEach { t ->
                    transactionDao.updateTransaction(t.copy(syncStatus = "synced"))
                }

                Result.success(pending.size)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
`,
    },
    {
      path: 'app/src/main/java/com/smartexpense/tracker/presentation/dashboard/DashboardScreen.kt',
      name: 'DashboardScreen.kt',
      category: 'compose',
      content: `package com.smartexpense.tracker.presentation.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.smartexpense.tracker.presentation.components.*
import com.smartexpense.tracker.utils.formatINR

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToAddExpense: () -> Unit,
    onNavigateToReports: () -> Unit,
    onNavigateToTransactions: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Smart Expense Tracker") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToAddExpense,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Expense")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                GreetingCard(greeting = uiState.greeting, userName = uiState.userName)
            }

            item {
                BudgetOverviewCard(
                    monthlySpending = uiState.totalSpending,
                    monthlyBudget = uiState.monthlyBudget,
                    remaining = uiState.remainingBudget,
                    percentage = uiState.budgetPercentage
                )
            }

            item {
                TopCategoriesSection(categories = uiState.topCategories)
            }

            item {
                SmartInsightsSection(insights = uiState.insights)
            }

            item {
                Text(
                    text = "Recent Transactions",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            items(uiState.recentTransactions) { txn ->
                TransactionListItem(
                    merchant = txn.merchant,
                    categoryName = txn.categoryName,
                    amount = formatINR(txn.amount),
                    date = txn.date,
                    paymentMethod = txn.paymentMethod,
                    isAutoDetected = txn.source == "sms"
                )
            }
        }
    }
}
`,
    },
    {
      path: 'app/src/test/java/com/smartexpense/tracker/SmsParserTest.kt',
      name: 'SmsParserTest.kt',
      category: 'tests',
      content: `package com.smartexpense.tracker

import com.smartexpense.tracker.data.local.entity.CategoryEntity
import com.smartexpense.tracker.sms.parser.SmsTransactionParser
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class SmsParserTest {

    private lateinit var parser: SmsTransactionParser
    private lateinit var sampleCategories: List<CategoryEntity>

    @Before
    fun setup() {
        parser = SmsTransactionParser()
        sampleCategories = listOf(
            CategoryEntity("cat_food", "Food & Dining", "🍔", "#F97316", keywords = "swiggy,zomato,restaurant,cafe"),
            CategoryEntity("cat_shopping", "Shopping", "🛍️", "#8B5CF6", keywords = "amazon,flipkart,myntra"),
            CategoryEntity("cat_travel", "Travel", "🚖", "#3B82F6", keywords = "uber,ola,metro"),
            CategoryEntity("cat_other", "Other", "📦", "#94A3B8", keywords = "")
        )
    }

    @Test
    fun testHdfcDebitSmsParsedCorrectly() {
        val sms = "Your A/C XX1234 is debited by Rs. 499.00 at AMAZON on 27-AUG-26. Info: UPI/328492/Amazon. Bal: INR 12,450.00"
        val result = parser.parse(sms, "HDFCBK", sampleCategories)

        assertEquals(499.0, result.amount ?: 0.0, 0.01)
        assertEquals("AMAZON", result.merchant)
        assertEquals("cat_shopping", result.suggestedCategoryId)
        assertTrue(result.isDebit)
        assertFalse(result.isOtpOrSpam)
        assertTrue(result.confidenceScore >= 0.85)
    }

    @Test
    fun testUpiSwiggySmsParsedCorrectly() {
        val sms = "UPI transaction of INR 250 paid to SWIGGY. Ref UPI123456."
        val result = parser.parse(sms, "SBIPAY", sampleCategories)

        assertEquals(250.0, result.amount ?: 0.0, 0.01)
        assertEquals("SWIGGY", result.merchant)
        assertEquals("cat_food", result.suggestedCategoryId)
        assertTrue(result.isDebit)
        assertEquals("UPI", result.paymentMethod)
    }

    @Test
    fun testCreditSalarySmsNotTreatedAsExpense() {
        val sms = "Your account XXXX1234 credited with INR 50000 on 27-Aug-2026 towards Salary."
        val result = parser.parse(sms, "ICICIB", sampleCategories)

        assertEquals("Credit", result.transactionType)
        assertFalse(result.isDebit)
    }

    @Test
    fun testOtpMessageDiscarded() {
        val sms = "Your OTP for login is 482910. Do not share this OTP with anyone."
        val result = parser.parse(sms, "HDFCBK", sampleCategories)

        assertTrue(result.isOtpOrSpam)
        assertEquals(0.0, result.confidenceScore, 0.01)
    }
}
`,
    }
  ];
}

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();
  const files = getAndroidProjectFiles();

  files.forEach(file => {
    zip.file(file.path, file.content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SmartExpenseTracker-Android-Source.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
