# 保存并搜索数据

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/search/search.html>

有很多方法可以储存你的数据，比如储存在线上的数据库，本地的SQLite数据库，甚至是文本文件。你自己来选择最适合你应用的存储方式。本节课程会向你展示如何创建一个健壮的可以提供全文搜索的SQLite虚拟表。并从一个每行有一组单词-解释对的文件中将数据填入。

##创建虚拟表

虚拟表与SQLite表的运行方式类似，但虚拟表是通过回调来向内存中的对象进行读取和写入，而不是通过数据库文件。要创建一个虚拟表，首先为该表创建一个类:

```java
public class DatabaseTable {
    private final DatabaseOpenHelper mDatabaseOpenHelper;

    public DatabaseTable(Context context) {
        mDatabaseOpenHelper = new DatabaseOpenHelper(context);
    }
}
```

在`DatabaseTable`类中创建一个继承[SQLiteOpenHelper](http://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper.html)的内部类。你必须重写类[SQLiteOpenHelper](http://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper.html)中定义的abstract方法，才能在必要的时候创建和更新你的数据库表。例如，下面一段代码声明了一个数据库表，用来储存字典app所需的单词。

```java
public class DatabaseTable {

    private static final String TAG = "DictionaryDatabase";

    //字典的表中将要包含的列项
    public static final String COL_WORD = "WORD";
    public static final String COL_DEFINITION = "DEFINITION";

    private static final String DATABASE_NAME = "DICTIONARY";
    private static final String FTS_VIRTUAL_TABLE = "FTS";
    private static final int DATABASE_VERSION = 1;

    private final DatabaseOpenHelper mDatabaseOpenHelper;

    public DatabaseTable(Context context) {
        mDatabaseOpenHelper = new DatabaseOpenHelper(context);
    }

    private static class DatabaseOpenHelper extends SQLiteOpenHelper {

        private final Context mHelperContext;
        private SQLiteDatabase mDatabase;

        private static final String FTS_TABLE_CREATE =
                    "CREATE VIRTUAL TABLE " + FTS_VIRTUAL_TABLE +
                    " USING fts3 (" +
                    COL_WORD + ", " +
                    COL_DEFINITION + ")";

        DatabaseOpenHelper(Context context) {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
            mHelperContext = context;
        }

        @Override
        public void onCreate(SQLiteDatabase db) {
            mDatabase = db;
            mDatabase.execSQL(FTS_TABLE_CREATE);
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            Log.w(TAG, "Upgrading database from version " + oldVersion + " to "
                    + newVersion + ", which will destroy all old data");
            db.execSQL("DROP TABLE IF EXISTS " + FTS_VIRTUAL_TABLE);
            onCreate(db);
        }
    }
}
```

##填入虚拟表

现在，表需要数据来储存。下面的代码会向你展示如何读取一个内容为单词和解释的文本文件(位于`res/raw/definitions.txt`)，如何解析文件与如何将文件中的数据按行插入虚拟表中。为防止UI锁死这些操作会在另一条线程中执行。将下面的一段代码添加到你的`DatabaseOpenHelper`内部类中。

>**Tip**:你也可以设置一个回调来通知你的UI activity线程的完成结果。

```java
private void loadDictionary() {
        new Thread(new Runnable() {
            public void run() {
                try {
                    loadWords();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }).start();
    }

private void loadWords() throws IOException {
    final Resources resources = mHelperContext.getResources();
    InputStream inputStream = resources.openRawResource(R.raw.definitions);
    BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));

    try {
        String line;
        while ((line = reader.readLine()) != null) {
            String[] strings = TextUtils.split(line, "-");
            if (strings.length < 2) continue;
            long id = addWord(strings[0].trim(), strings[1].trim());
            if (id < 0) {
                Log.e(TAG, "unable to add word: " + strings[0].trim());
            }
        }
    } finally {
        reader.close();
    }
}

public long addWord(String word, String definition) {
    ContentValues initialValues = new ContentValues();
    initialValues.put(COL_WORD, word);
    initialValues.put(COL_DEFINITION, definition);

    return mDatabase.insert(FTS_VIRTUAL_TABLE, null, initialValues);
}
```

任何恰当的地方，都可以调用`loadDictionary()`方法向表中填入数据。一个比较好的地方是`DatabaseOpenHelper`类的[onCreate()](http://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper.html#onCreate(android.database.sqlite.SQLiteDatabase))方法中，紧随创建表之后:

```java
@Override
public void onCreate(SQLiteDatabase db) {
    mDatabase = db;
    mDatabase.execSQL(FTS_TABLE_CREATE);
    loadDictionary();
}
```

##搜索请求

当你的虚拟表创建好并填入数据后，根据[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)提供的请求搜索数据。将下面的方法添加到`DatabaseTable`类中，用来创建搜索请求的SQL语句:

```java
public Cursor getWordMatches(String query, String[] columns) {
    String selection = COL_WORD + " MATCH ?";
    String[] selectionArgs = new String[] {query+"*"};

    return query(selection, selectionArgs, columns);
}

private Cursor query(String selection, String[] selectionArgs, String[] columns) {
    SQLiteQueryBuilder builder = new SQLiteQueryBuilder();
    builder.setTables(FTS_VIRTUAL_TABLE);

    Cursor cursor = builder.query(mDatabaseOpenHelper.getReadableDatabase(),
            columns, selection, selectionArgs, null, null, null);

    if (cursor == null) {
        return null;
    } else if (!cursor.moveToFirst()) {
        cursor.close();
        return null;
    }
    return cursor;
}
```

调用`getWordMatches()`来搜索请求。任何符合的结果返回到[Cursor](http://developer.android.com/reference/android/database/Cursor.html)中，可以直接遍历或是建立一个[ListView](http://developer.android.com/reference/android/widget/ListView.html)。这个例子是在检索activity的`handleIntent()`方法中调用`getWordMatches()`。请记住，因为之前创建的intent filter，检索activity会在[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent中额外接收请求作为变量存储:

```java
DatabaseTable db = new DatabaseTable(this);

...

private void handleIntent(Intent intent) {

    if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
        String query = intent.getStringExtra(SearchManager.QUERY);
        Cursor c = db.getWordMatches(query, null);
        //执行Cursor并显示结果
    }
}
```
