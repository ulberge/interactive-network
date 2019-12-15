import numpy as np
import cv2

np.set_printoptions(threshold=np.inf, precision=3)


def process_img(name):
    # max_val = 16
    # img = cv2.imread(name + '.png')
    # img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # img = cv2.resize(img, (11, 11), interpolation=cv2.INTER_AREA)
    # img = cv2.normalize(img, None, alpha=-1, beta=1, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    # # img = (img - 127.0) / 255
    # img = img[3:8, 3:8]
    # save_img(img, name + '_test.png')
    # return img
    # size = 31
    # img = cv2.imread(name + '.png')
    # img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
    # img = (img - 127.0) / 20
    # img = img[8:23, 8:23]
    # save_img(img, name + '_test.png')
    # return img

    img = cv2.imread(name + '.png')
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = 1 - img / 255.0
    return img


def save_img(img, name):
    img = cv2.normalize(img, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    img = img.astype(np.uint8)
    cv2.imwrite(name, img)


if __name__ == '__main__':
    imgs = [process_img('corner0'), process_img('corner1'), process_img('corner2'), process_img('corner2')]
    # imgs = [[process_img('g0')], [process_img('g2')], [process_img('g3')], [process_img('g1')]]

    print(repr(imgs).replace('array(', '').replace(')', '').replace('\n', '').replace(' ', '').replace(',dtype=float32', ''))

    # test = np.array([[-1.4,-1.45,-1.45,-1.25,-1.35,-2.15,-1.45,-0.15,-1.45,-2.15,-1.35,-1.25,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.2,-1.35,-2.6,-1.5,0.55,-1.5,-2.6,-1.35,-1.2,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.05,-1.3,-3.15,-1.5,1.5,-1.5,-3.15,-1.3,-1.1,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.95,-1.25,-3.75,-1.5,2.55,-1.55,-3.75,-1.25,-0.95,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.85,-1.2,-4.4,-1.55,3.6,-1.55,-4.4,-1.2,-0.85,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.7,-1.15,-4.95,-1.6,4.55,-1.6,-4.95,-1.15,-0.7,-1.45,-1.45,-1.4],[-1.4,-1.5,-1.5,-0.65,-1.15,-5.3,-1.6,5.1,-1.6,-5.3,-1.15,-0.65,-1.5,-1.5,-1.4],[-1.4,-1.5,-1.5,-0.65,-1.15,-5.4,-1.6,5.3,-1.6,-5.4,-1.15,-0.65,-1.5,-1.5,-1.4],[-1.4,-1.5,-1.45,-0.65,-1.15,-5.25,-1.6,4.95,-1.6,-5.25,-1.15,-0.65,-1.45,-1.5,-1.4],[-1.4,-1.45,-1.45,-0.75,-1.2,-4.8,-1.55,4.25,-1.6,-4.8,-1.2,-0.75,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-0.85,-1.25,-4.2,-1.55,3.3,-1.55,-4.2,-1.25,-0.9,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.,-1.3,-3.6,-1.5,2.2,-1.5,-3.6,-1.3,-1.,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.1,-1.3,-2.95,-1.5,1.2,-1.5,-2.95,-1.3,-1.1,-1.45,-1.45,-1.4],[-1.4,-1.45,-1.45,-1.2,-1.35,-2.45,-1.5,0.3,-1.5,-2.45,-1.35,-1.2,-1.45,-1.45,-1.4],[-1.4,-1.4,-1.45,-1.3,-1.35,-2.05,-1.45,-0.35,-1.45,-2.05,-1.35,-1.3,-1.45,-1.4,-1.4]])

    # print(test)
    # save_img(test, 'test.png')

