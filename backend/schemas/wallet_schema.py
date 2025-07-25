from extensions import ma
from models.wallet import Wallet

class WalletSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Wallet
        load_instance = True

wallet_schema = WalletSchema()
