import MySQLdb
import gc

class DatabaseConnection:
    """
    Class to handle all database operations
    """
    def __init__(self, address, user, password, schema):
        """
        Constructor for DatabaseConnection class
        :param address: address of the database
        :param user: user to use to connect to the database
        :param password: password for the user
        :param schema: which schema to use
        """
        self.address = address
        self.user = user
        self.password = password
        self.schema = schema
        self.c = None
        self.conn = None
        self.isConnected = False

    def connect(self, dictionary=False):
        """
        Connects to the database
        """
        self.conn = MySQLdb.connect(host=self.address,
                                    port=3306,
                                    user=self.user,
                                    passwd=self.password,
                                    db=self.schema)
        if dictionary:
            self.c = self.conn.cursor(MySQLdb.cursors.DictCursor)
        else:
            self.c = self.conn.cursor()

        self.isConnected = True

    def disconnect(self):
        """
        Disconnects from the database
        """
        try:
            self.c.close()
            self.conn.close()
        except Exception as e:
            print(e)
        gc.collect()
        self.isConnected = False

    def execute(self, sql, values=()):
        """
        Executes an sql statement
        :param sql: statement to commit
        :param values: values inside the statement
        :return: number of results found
        """
        return self.c.execute(sql, values)

    def commit(self):
        """
        Makes changes to the databases
        """
        self.conn.commit()

    def getAll(self):
        return self.c.fetchall()

    def getOne(self):
        return self.c.fetchone()

    def getIsConnected(self):
        return self.isConnected