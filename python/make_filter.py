import numpy as np
import cv2

np.set_printoptions(threshold=np.inf, precision=3)


def process_img(name):
    size = 15
    max_val = 16
    img = cv2.imread(name + '.png')
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
    img = (img - 127.0) / 20
    return img

if __name__ == '__main__':
    imgs = [[process_img('g0')], [process_img('g1')], [process_img('g2')], [process_img('g3')]]

    print(repr(imgs).replace('array(', '').replace(')', '').replace('\n', '').replace(' ', ''))
