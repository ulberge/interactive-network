import os
import scipy.io as sio
import tensorflow as tf
from tensorflow.keras import datasets, layers, models, initializers
import numpy as np

def load_pretrained(filepath):
    """
    From https://github.com/ayush29feb/Sketch-A-XNORNet/
    Loads the pretrained weights and biases from the pretrained model available
    on http://www.eecs.qmul.ac.uk/~tmh/downloads.html
    Args:
        Takes in the filepath for the pretrained .mat filepath

    Returns:
        Returns the dictionary with all the weights and biases for respective layers
    """
    if filepath is None or not os.path.isfile(filepath):
        print('Pretrained Model Not Available!')
        return None, None

    data = sio.loadmat(filepath)
    weights = {}
    biases = {}
    conv_idxs = [0, 3, 6, 8, 10, 13, 16, 19]
    for i, idx in enumerate(conv_idxs):
        weights['conv' + str(i + 1)] = data['net']['layers'][0][0][0][idx]['filters'][0][0]
        biases['conv' + str(i + 1)] = data['net']['layers'][0][0][0][idx]['biases'][0][0].reshape(-1)

    print('Pretrained Model Loaded!')
    return (weights, biases)


if __name__ == '__main__':
    weights, biases = load_pretrained('./model_without_order_info_224.mat')

    # weights are an object of 4D arrays
    # biases are an object of 1D arrays
    # convert to csv
    weights_arr = []
    biases_arr = []
    for i in range(1, 9):
        weights_arr.append(weights['conv' + str(i)])
        biases_arr.append(biases['conv' + str(i)])

    print(len(weights_arr))
    print(len(biases_arr))

    # np.savetxt('model_sketch_a_net.txt', bias_arr, delimiter=',')

    model_file = open('model_sketch_a_net.txt', 'w')
    # model_file.write(weights_arr.tolist())
    for layer in weights_arr[:1]:
        model_file.write(layer.tolist())
        model_file.write(',')
    # np.array2string(c2.numpy(), separator=',')
    # model_file.write('[')
    # for layer in weights_arr:
    #     model_file.write('[')
    #     for c0 in layer:
    #         model_file.write('[')
    #         for c1 in c0:
    #             model_file.write('[')
    #             for c2 in c1:
    #                 model_file.write('[')
    #                 # for c3 in c2:
    #                 item = np.array2string(c2.numpy(), separator=',')
    #                 model_file.write(item)
    #                 model_file.write('],')
    #             model_file.write('],')
    #         model_file.write('],')
    #     model_file.write('],')
    # model_file.write(']')


    # async function getTopMatchesData(fileName) {
    #     return new Promise((resolve) => {
    #       $.get(fileName, function(data) {
    #         const topMatchesData = data.split(':').map(g => g.trim().split('\n').map(acts => acts.split(',').map(v => v < 0 ? 0 : v)));
    #         topMatchesData.pop();
    #         // console.log(topMatchesData);
    #         resolve(topMatchesData);
    #       });
    #     });
    #   }

    #       let weights1 = [
    #   [  // Filter vertical
    #     [  // Ch 0
    #         [-1, 2, -1],
    #         [-1, 2, -1],
    #         [-1, 2, -1],
    #     ]
    #   ],
    #   [  // Filter horizontal
    #     [  // Ch 0
    #         [-1, -1, -1],
    #         [2, 2, 2],
    #         [-1, -1, -1],
    #     ]
    #   ],
    # ];
    # // const biases1 = Array(2).fill(-2);
    # const biases1 = Array(2).fill(0);
