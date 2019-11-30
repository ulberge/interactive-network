import numpy as np
import cv2
import h5py
import sys
import random
import math

np.set_printoptions(threshold=np.inf, precision=3)

def process_img(name):
    size = 15
    max_val = 16
    img = cv2.imread(name + '.png')
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
    img = (img - 127.0) / 20
    return img


def save_img(img, name):
    img = cv2.normalize(img, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    img = img.astype(np.uint8)
    cv2.imwrite(name, img)


def get_pieces(img, size, stride, pct=1, thresh=None, thresh_pct=1):
    img_pieces = []
    h, w = img.shape[:2]
    stridesY = int((h - size) / stride)
    stridesX = int((w - size) / stride)
    for y in range(stridesY):
        for x in range(stridesX):
            # skip some percentage
            if random.random() > pct:
                continue

            # get section of original image
            x_start = x * stride
            x_end = x_start + size
            y_start = y * stride
            y_end = y_start + size
            img_piece = img[y_start: y_end, x_start: x_end]

            # skip if threshold for empty images not met
            if thresh is not None:
                if np.sum(img_piece) < thresh and random.random() > thresh_pct:
                    continue

            img_pieces.append(img_piece)

    return img_pieces


def load_corpus_imgs(sample_rate):
    print('Loading images from corpus')
    # load images from dataset
    data = h5py.File('../../SketchANetClustering/data/dataset_without_order_info_224.mat', 'r')
    all_imgs = data['imdb']['images']['data']

    imgs = [all_imgs[idx] for idx in range(0, len(all_imgs), sample_rate)]

    # format images for Sketch-A-Net
    imgs_f = []
    for img in imgs:
        # resize and format image
        img = img.swapaxes(0, 2)
        img = img[16:241, 16:241, :]
        img = img / 255
        img = 1 - img
        imgs_f.append(img)
    imgs = imgs_f

    print('Chose ' + str(len(imgs)) + ' images')
    return imgs


def save_imgs(imgs, name, num_cols=10, pad=2):
    if len(imgs) == 0 or imgs[0] is None:
        return

    h = imgs[0].shape[0]
    w = imgs[0].shape[1]

    # Make cv img and write to it...
    num_rows = int(math.ceil(len(imgs) / float(num_cols)))
    total_img = np.ones(((h + (2 * pad)) * num_rows, (w + (2 * pad)) * num_cols))

    print('Start compile image')
    for i, img in enumerate(imgs):
        row = int(math.floor(i / float(num_cols)))
        col = i % num_cols
        if img is not None:
            img_pad = img.squeeze()
            h, w = img_pad.shape
            y = ((h + (pad * 2)) * row) + pad
            y_end = y + h
            x = ((w + (pad * 2)) * col) + pad
            x_end = x + w
            total_img[y:y_end, x:x_end] = img_pad
    print('Finished compile image')

    print('Start saving image')
    cv2.imwrite(name + '.png', total_img * 255)
    print('Finished saving image')


if __name__ == '__main__':
    imgs = load_corpus_imgs(200)
    pieces = []
    for img in imgs:
        pieces.extend(get_pieces(img, 45, 10, 0.01, 0.1, 0.01))

    # print('Saving ' + str(len(pieces)) + ' images')
    # save_imgs(pieces, 'corpus', 20)
    print(pieces[0].shape)

    print('Save data')
    to_file = open('../public/corpus.txt', 'w')
    to_file.write('window.corpus = [\n')
    for i, piece in enumerate(pieces):
        print(i)
        to_file.write('[' + ','.join([('[' + ','.join(map(str, row.squeeze())) + ']') for row in piece]) + '],\n')
    to_file.write('];\n')



