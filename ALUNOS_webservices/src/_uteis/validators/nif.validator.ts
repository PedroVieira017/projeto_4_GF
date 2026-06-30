import {
    ValidationArguments,
    registerDecorator,
} from 'class-validator';
import {validateNif} from "../uteis";

export function IsValidNIF() {
    return (object: any, propertyName: string) =>
        registerDecorator({
            name: 'IsValidNIF',
            target: object.constructor,
            propertyName,
            constraints: [],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    try {
                        return validateNif(value);
                    } catch (error) {
                        return false;
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    return 'NIF inválido.';
                }
            },
        });
}