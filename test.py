import threading 
import time 


def sayTime(name):
    time.sleep(2)
    print("This is the time", time.time(), name)

x = threading.Thread(target=sayTime, args=("first",))
x.start()
print(time.time())
print("blah blaj")

x.join()
print("after")

