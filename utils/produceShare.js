export const calculateProduceShare = (adoptedTrees) => {
    const FARMER_SHARE_PERCENTAGE = 50;
    const productiveTrees = adoptedTrees.filter((adoptedTree) => adoptedTree.tree.produce > 0);
    const totalUserProduce = productiveTrees.reduce((total, adoptedTree) => total + adoptedTree.tree.produce, 0);

    let userSharePercentage = (totalUserProduce / 100) * (100 - FARMER_SHARE_PERCENTAGE);

    return {
        userSharePercentage
    };
};


